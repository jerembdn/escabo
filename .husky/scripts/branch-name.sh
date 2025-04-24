#!/bin/bash
# Reference: https://docs.zymu.app/contributing/commits

branchName="$(git rev-parse --abbrev-ref HEAD)"

# Define regex pattern for valid branch names
# - develop, release are valid
# - [category/username]/[description] format is valid where:
#   - category/username is alphanumeric with hyphens
#   - description is lowercase letters with hyphens
regex="^(develop|release|main)$|^([a-z0-9-]+)\/([a-z-]+)$"

# Colorize output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═════════════════[ branch validation ]═════════════════${NC}"
echo ""
echo -e "branch: ${BLUE}$branchName${NC}"
echo ""

if [[ $branchName =~ $regex ]]; then
  echo -e "${GREEN}✓ valid branch name${NC}"
else
  echo -e "${RED}✗ branch name is invalid!${NC}"
  echo ""
  echo "branch name must be one of:"
  echo "  - develop, main, or release"
  echo "  - [category/username]/[description] (e.g., feature/user-auth or jerembdn/fix-typo)"
  echo ""
  echo "  where:"
  echo "    - category/username: lowercase alphanumeric with hyphens"
  echo "    - description: lowercase alphanumeric with hyphens"
  echo ""
  echo -e "please check our contributing guidelines: ${BLUE}https://docs.zymu.app/contributing${NC}"
  exit 1
fi

echo ""
exit 0
