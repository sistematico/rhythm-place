#!/usr/bin/env bash

SESSION="rhythm"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux attach-session -t "$SESSION"
  exit 0
fi

tmux new-session -d -s "$SESSION" "bun dev"
tmux new-window -t "$SESSION"
tmux attach-session -t "$SESSION"
