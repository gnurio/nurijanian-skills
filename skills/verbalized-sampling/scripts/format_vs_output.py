#!/usr/bin/env python3
"""
format_vs_output.py — Format Verbalized Sampling JSON output as readable markdown.

Usage:
    echo '<json>' | python format_vs_output.py
    python format_vs_output.py output.json
    python format_vs_output.py output.json --threshold-high 0.05 --threshold-mid 0.15
    python format_vs_output.py output.json --sort prob   # sort by probability ascending (most novel first)
    python format_vs_output.py output.json --sort text   # sort alphabetically
    python format_vs_output.py output.json --no-tiers   # flat numbered list, no grouping
"""

import json
import sys
import argparse


def load_json(source: str | None) -> dict:
    if source:
        with open(source) as f:
            return json.load(f)
    raw = sys.stdin.read().strip()
    return json.loads(raw)


def detect_key(data: dict) -> tuple[str, list]:
    """Return (key, items) for the first list value found in the JSON object."""
    for key, value in data.items():
        if isinstance(value, list) and value:
            return key, value
    raise ValueError("No list found in JSON. Expected: {\"key\": [{\"text\": ..., \"probability\": ...}, ...]}")


def get_probability(item: dict) -> float:
    for field in ("probability", "prob", "p", "score", "likelihood"):
        if field in item:
            try:
                return float(item[field])
            except (TypeError, ValueError):
                pass
    return 0.0


def get_text(item: dict) -> str:
    for field in ("text", "content", "output", "response", "idea", "answer"):
        if field in item:
            return str(item[field])
    # Fall back to first string value
    for v in item.values():
        if isinstance(v, str):
            return v
    return str(item)


def extra_fields(item: dict) -> dict:
    """Return fields beyond text and probability for optional display."""
    skip = {"text", "content", "output", "response", "idea", "answer",
            "probability", "prob", "p", "score", "likelihood"}
    return {k: v for k, v in item.items() if k not in skip}


def tier_label(prob: float, high: float, mid: float) -> str:
    if prob < high:
        return f"High diversity (p < {high})"
    elif prob < mid:
        return f"Moderate diversity (p {high}–{mid})"
    else:
        return f"Common / low diversity (p ≥ {mid})"


def format_output(
    items: list,
    key: str,
    threshold_high: float = 0.05,
    threshold_mid: float = 0.15,
    sort_by: str = "prob",
    no_tiers: bool = False,
    show_extras: bool = True,
    tail_sampled: bool = False,
) -> str:
    n = len(items)
    lines = [f"# VS Output — {key} (n={n})\n"]

    # Sort
    if sort_by == "prob":
        items = sorted(items, key=get_probability)
    elif sort_by == "text":
        items = sorted(items, key=get_text)
    # default: preserve original order

    if no_tiers:
        for i, item in enumerate(items, 1):
            prob = get_probability(item)
            text = get_text(item)
            lines.append(f"{i}. {text} (p={prob:.2f})")
            if show_extras:
                for k, v in extra_fields(item).items():
                    lines.append(f"   - **{k}**: {v}")
        return "\n".join(lines)

    # Group into tiers
    tiers: dict[str, list] = {}
    order: list[str] = []
    for item in items:
        prob = get_probability(item)
        label = tier_label(prob, threshold_high, threshold_mid)
        if label not in tiers:
            tiers[label] = []
            order.append(label)
        tiers[label].append(item)

    counter = 1
    for label in order:
        lines.append(f"\n## {label}")
        for item in tiers[label]:
            prob = get_probability(item)
            text = get_text(item)
            lines.append(f"{counter}. {text} (p={prob:.2f})")
            if show_extras:
                for k, v in extra_fields(item).items():
                    lines.append(f"   - **{k}**: {v}")
            counter += 1

    # Diagnostic: check probability spread (skip if tail sampling was explicit)
    probs = [get_probability(i) for i in items]
    if probs and not tail_sampled:
        spread = max(probs) / max(min(probs), 0.001)
        if spread < 3:
            lines.append(
                f"\n---\n> **Warning (FM-4)**: Probability spread is {spread:.1f}× (max/min). "
                "Values below 3× on full-distribution sampling suggest overfit topic collapse. "
                "If you used tail sampling intentionally, pass `--tail-sampled` to suppress this. "
                "Otherwise: add domain constraints or richer context."
            )

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Format Verbalized Sampling JSON output as readable markdown."
    )
    parser.add_argument("file", nargs="?", help="JSON file path (default: stdin)")
    parser.add_argument(
        "--threshold-high", type=float, default=0.05,
        help="Probability below which outputs are 'high diversity' (default: 0.05)"
    )
    parser.add_argument(
        "--threshold-mid", type=float, default=0.15,
        help="Probability below which outputs are 'moderate diversity' (default: 0.15)"
    )
    parser.add_argument(
        "--sort", choices=["prob", "text", "original"], default="prob",
        help="Sort order: prob (ascending, most novel first), text (alpha), original (default: prob)"
    )
    parser.add_argument(
        "--no-tiers", action="store_true",
        help="Flat numbered list without diversity tier grouping"
    )
    parser.add_argument(
        "--no-extras", action="store_true",
        help="Hide extra fields (rationale, error_type, etc.)"
    )
    parser.add_argument(
        "--tail-sampled", action="store_true",
        help="Suppress FM-4 spread warning — use when you explicitly requested tail sampling (tight spread is expected)"
    )
    args = parser.parse_args()

    try:
        data = load_json(args.file)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON — {e}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print(f"Error: File not found — {args.file}", file=sys.stderr)
        sys.exit(1)

    try:
        key, items = detect_key(data)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    output = format_output(
        items=items,
        key=key,
        threshold_high=args.threshold_high,
        threshold_mid=args.threshold_mid,
        sort_by=args.sort,
        no_tiers=args.no_tiers,
        show_extras=not args.no_extras,
        tail_sampled=args.tail_sampled,
    )
    print(output)


if __name__ == "__main__":
    main()
