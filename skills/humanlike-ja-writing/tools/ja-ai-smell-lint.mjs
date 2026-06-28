#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const jsonOutput = args.includes('--json');
const target = args.find((arg) => !arg.startsWith('--'));

function readInput() {
  if (target) {
    return { label: target, text: fs.readFileSync(target, 'utf8') };
  }
  return { label: '<stdin>', text: fs.readFileSync(0, 'utf8') };
}

function loadExpressions() {
  const dataPath = path.resolve(__dirname, '../data/high-risk-expressions.ja.json');
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function addIssue(issues, issue) {
  issues.push({
    line: issue.line ?? null,
    severity: issue.severity ?? 'minor',
    category: issue.category ?? 'surface',
    id: issue.id,
    pattern: issue.pattern,
    reason: issue.reason,
    suggestion: issue.suggestion
  });
}

function splitLines(text) {
  return text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
}

function lintExpressions(lines, expressions, issues) {
  for (const [index, line] of lines.entries()) {
    for (const item of expressions) {
      if (item.pattern_type === 'regex') {
        const re = new RegExp(item.pattern, 'u');
        if (re.test(line)) addIssue(issues, { ...item, line: index + 1 });
      } else if (line.includes(item.pattern)) {
        addIssue(issues, { ...item, line: index + 1 });
      }
    }
  }
}

function lintSurface(lines, issues) {
  for (const [index, line] of lines.entries()) {
    const lineNo = index + 1;

    if (line.includes('——') || line.includes('――') || line.includes('—')) {
      addIssue(issues, {
        line: lineNo,
        severity: 'minor',
        category: 'surface_marker',
        id: 'surface_dash',
        pattern: 'dash',
        reason: '全角ダッシュやエムダッシュはAI出力の癖に見える場合があります。',
        suggestion: '読点、括弧、普通の文へ置き換える。'
      });
    }

    const hasBoldColon = line.includes('**') && (line.includes('**:') || line.includes('**：') || line.includes(':**') || line.includes('：**'));
    if (hasBoldColon) {
      addIssue(issues, {
        line: lineNo,
        severity: 'minor',
        category: 'markdown_artifact',
        id: 'surface_bold_colon',
        pattern: '**label:**',
        reason: '太字コロン箇条書きはAI出力のフォーマット癖に見えやすいです。',
        suggestion: '見出しまたは普通の箇条書きにする。'
      });
    }

    if (line.includes('contentReference') || line.includes('oai_citation')) {
      addIssue(issues, {
        line: lineNo,
        severity: 'major',
        category: 'artifact',
        id: 'surface_tool_artifact',
        pattern: 'tool artifact',
        reason: '生成ツール由来の残骸に見えます。',
        suggestion: '削除または正しい引用形式に直す。'
      });
    }
  }
}

function splitSentences(text) {
  const sentences = [];
  let current = '';
  for (const char of text.replaceAll('\n', ' ')) {
    current += char;
    if ('。！？!?'.includes(char)) {
      const trimmed = current.trim();
      if (trimmed) sentences.push(trimmed);
      current = '';
    }
  }
  const rest = current.trim();
  if (rest) sentences.push(rest);
  return sentences;
}

function lintRhythm(text, issues) {
  const sentences = splitSentences(text);
  if (sentences.length < 8) return;

  const endings = [];
  const candidates = ['です', 'ます', 'ました', 'でしょう', 'ください', 'だ', 'である', 'だった'];
  for (const sentence of sentences) {
    const normalized = sentence.replace(/[。！？!?]$/u, '');
    const ending = candidates.find((candidate) => normalized.endsWith(candidate));
    if (ending) endings.push(ending);
  }

  const counts = new Map();
  for (const ending of endings) counts.set(ending, (counts.get(ending) || 0) + 1);
  const maxCount = Math.max(0, ...counts.values());
  if (endings.length >= 8 && maxCount / endings.length >= 0.75) {
    addIssue(issues, {
      severity: 'minor',
      category: 'rhythm',
      id: 'rhythm_repeated_endings',
      pattern: 'sentence endings',
      reason: '同じ語尾が続き、リズムが均質に見えます。',
      suggestion: '文の役割を変え、短い判断文や具体例を混ぜる。'
    });
  }

  const lengths = sentences.map((sentence) => [...sentence].length);
  const average = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  const variance = lengths.reduce((sum, length) => sum + (length - average) ** 2, 0) / lengths.length;
  const coefficient = Math.sqrt(variance) / average;
  if (average > 22 && coefficient < 0.25) {
    addIssue(issues, {
      severity: 'minor',
      category: 'rhythm',
      id: 'rhythm_uniform_sentence_length',
      pattern: 'sentence length',
      reason: '文長が揃いすぎています。',
      suggestion: '説明文と短い判断文を混ぜる。'
    });
  }
}

function lintStructure(lines, issues) {
  const nonEmpty = lines.filter((line) => line.trim()).length;
  const headingCount = lines.filter((line) => line.trim().startsWith('#')).length;
  if (nonEmpty >= 20 && headingCount / nonEmpty > 0.22) {
    addIssue(issues, {
      severity: 'minor',
      category: 'structure',
      id: 'structure_heading_density',
      pattern: 'headings',
      reason: '見出し密度が高く、過剰に構造化されて見える場合があります。',
      suggestion: '短い節は本文に統合する。'
    });
  }

  const transitions = ['また', 'さらに', '加えて', '一方で', 'なお', 'つまり'];
  const hits = lines.filter((line) => transitions.some((word) => line.trim().startsWith(word))).length;
  if (hits >= 5) {
    addIssue(issues, {
      severity: 'minor',
      category: 'structure',
      id: 'structure_transition_overuse',
      pattern: 'transitions',
      reason: '接続詞で整えすぎている可能性があります。',
      suggestion: '不要な接続詞を削り、段落の役割でつなぐ。'
    });
  }
}

function summarize(issues) {
  const summary = { critical: 0, major: 0, minor: 0 };
  for (const issue of issues) {
    if (issue.severity === 'critical') summary.critical += 1;
    else if (issue.severity === 'major') summary.major += 1;
    else summary.minor += 1;
  }
  const decision = summary.critical > 0 || summary.major > 0 ? 'rewrite-recommended' : summary.minor > 0 ? 'minor-edit' : 'pass';
  return { ...summary, decision };
}

function printReport(label, issues, summary) {
  console.log(`AI Smell Lint Report: ${label}`);
  console.log('');
  for (const [title, predicate] of [
    ['Critical', (issue) => issue.severity === 'critical'],
    ['Major', (issue) => issue.severity === 'major'],
    ['Minor', (issue) => issue.severity !== 'critical' && issue.severity !== 'major']
  ]) {
    const group = issues.filter(predicate);
    if (group.length === 0) continue;
    console.log(`${title}:`);
    for (const issue of group.sort((a, b) => (a.line || 999999) - (b.line || 999999))) {
      const loc = issue.line ? `L${issue.line}: ` : '';
      console.log(`- ${loc}${issue.pattern} (${issue.category})`);
      console.log(`  Reason: ${issue.reason}`);
      console.log(`  Suggestion: ${issue.suggestion}`);
    }
    console.log('');
  }
  console.log('Summary:');
  console.log(`- critical: ${summary.critical}`);
  console.log(`- major: ${summary.major}`);
  console.log(`- minor: ${summary.minor}`);
  console.log(`- decision: ${summary.decision}`);
}

try {
  const { label, text } = readInput();
  const lines = splitLines(text);
  const issues = [];
  lintExpressions(lines, loadExpressions(), issues);
  lintSurface(lines, issues);
  lintRhythm(text, issues);
  lintStructure(lines, issues);
  const summary = summarize(issues);

  if (jsonOutput) console.log(JSON.stringify({ label, summary, issues }, null, 2));
  else printReport(label, issues, summary);

  if (strict && (summary.critical > 0 || summary.major > 0)) process.exitCode = 1;
} catch (error) {
  console.error(`ja-ai-smell-lint failed: ${error.message}`);
  process.exitCode = 2;
}
