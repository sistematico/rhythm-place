#!/usr/bin/env bash

SESSION="rhythm"

attach_or_switch() {
  if [[ -n "${TMUX:-}" ]]; then
    tmux switch-client -t "$SESSION"
    return
  fi

  tmux attach-session -t "$SESSION"
}

if tmux has-session -t "$SESSION" 2>/dev/null; then
  attach_or_switch
  exit 0
fi

tmux new-session -d -s "$SESSION" "bun dev"
tmux new-window -t "$SESSION"
attach_or_switch
