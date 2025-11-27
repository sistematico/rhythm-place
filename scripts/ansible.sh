#!/usr/bin/env bash

MACHINE="tyche"
ROOT=$(dirname "$(readlink -f "$0")")

ANSIBLE_PYTHON_INTERPRETER=auto_silent \
  ANSIBLE_CONFIG="${ROOT}/../ansible/ansible.cfg" \
  ansible-playbook -e "ansible_port=2200" "${ROOT}/../ansible/main.yml" -i $MACHINE,