#!/bin/bash
# Reference: https://docs.zymu.app/contributing/commits

# Colorize output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if a commit message file was provided
if [ -z "$1" ]; then
  echo -e "${RED}error: no commit message file provided${NC}"
  exit 1
fi

# Read the commit message
message="$(cat "$1")"

# Define local gitmoji cache file to avoid network failures
CACHE_DIR="$HOME/.cache/zymu-hooks"
GITMOJI_CACHE="$CACHE_DIR/gitmojis.json"
CACHE_TTL=86400 # 24 hours in seconds

# Create cache directory if it doesn't exist
mkdir -p "$CACHE_DIR"

fetch_gitmojis() {
  echo -e "${BLUE}fetching gitmojis...${NC}"

  # Try to fetch the gitmojis with a timeout of 5 seconds
  if curl -s -m 5 https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json >"$GITMOJI_CACHE.tmp"; then
    mv "$GITMOJI_CACHE.tmp" "$GITMOJI_CACHE"
    echo -e "${GREEN}successfully fetched gitmojis${NC}"
    return 0
  else
    echo -e "${YELLOW}warning: failed to fetch gitmojis from remote. using cached version if available.${NC}"
    return 1
  fi
}

# Check if cache exists and is not too old
if [ ! -f "$GITMOJI_CACHE" ] || [ $(($(date +%s) - $(stat -c %Y "$GITMOJI_CACHE"))) -gt "$CACHE_TTL" ]; then
  fetch_gitmojis
fi

# Check if we have a valid gitmoji cache
if [ ! -f "$GITMOJI_CACHE" ]; then
  echo -e "${RED}error: could not fetch gitmojis and no cache exists${NC}"
  echo "please check your internet connection or try again later"
  exit 1
fi

# Parse gitmojis from cache
gitmojis=$(node -e "
try {
  const data = require('fs').readFileSync('$GITMOJI_CACHE', 'utf8');
  const gitmojis = JSON.parse(data).gitmojis.map(g => g.emoji);
  console.log(gitmojis.join(','));
} catch (error) {
  console.error('error parsing gitmoji cache: ' + error.message);
  process.exit(1);
}")

if [ $? -ne 0 ]; then
  echo -e "${RED}error parsing gitmoji cache. it may be corrupted.${NC}"
  echo "attempting to re-fetch gitmojis..."
  fetch_gitmojis

  # Try parsing again
  gitmojis=$(node -e "
  try {
    const data = require('fs').readFileSync('$GITMOJI_CACHE', 'utf8');
    const gitmojis = JSON.parse(data).gitmojis.map(g => g.emoji);
    console.log(gitmojis.join(','));
  } catch (error) {
    console.error('error parsing gitmoji cache: ' + error.message);
    process.exit(1);
  }")

  if [ $? -ne 0 ]; then
    echo -e "${RED}failed to parse gitmojis after re-fetching.${NC}"
    exit 1
  fi
fi

# Convert to array and clean up
IFS=',' read -ra gitmoji_array <<<"$gitmojis"
gitmoji_array=("${gitmoji_array[@]//[\'\",\[\]]/}")

# Define commit types
types=(
  "feat"     # New feature
  "fix"      # Bug fix
  "chore"    # Maintenance tasks
  "docs"     # Documentation changes
  "style"    # Code style changes
  "refactor" # Code refactoring
  "perf"     # Performance improvements
  "test"     # Add or update tests
  "build"    # Build system changes
  "ci"       # CI/CD changes
  "revert"   # Revert previous commits
  "merge"    # Merge branches
)

# Build regex patterns
separator="|"
emojiRegex=""
for g in "${gitmoji_array[@]}"; do
  # Escape special characters in emoji
  escaped_emoji=$(echo "$g" | sed 's/[]\/$*.^[]/\\&/g')
  emojiRegex="${emojiRegex}${separator}${escaped_emoji}"
done
emojiRegex="${emojiRegex:${#separator}}"

typesRegex="$(printf "${separator}%s" "${types[@]}")"
typesRegex="${typesRegex:${#separator}}"

# Build full regex for commit validation
regex="^(${emojiRegex}) (${typesRegex})(\(([a-z0-9-]+)\))?: (.+[a-z0-9(-)#@']{1,})([[-\]])?$"

echo -e "${BLUE}═════════════════[ commit message validation ]═════════════════${NC}"
echo ""

# Validate the commit message
if [[ $message =~ $regex ]]; then
  echo -e "${GREEN}✓ your commit message is valid!${NC}"
  echo ""
  echo -e "your commit message:"
  echo -e "${BLUE}$message${NC}"
else
  emojisStringList=$(printf ", %s" "${gitmoji_array[@]}")
  emojisStringList=${emojisStringList:2}

  typesStringList=$(printf ", %s" "${types[@]}")
  typesStringList=${typesStringList:2}

  echo -e "${RED}✗ your commit message is invalid!${NC}"
  echo ""
  echo "commit messages must follow the format:"
  echo -e "${YELLOW}:emoji: :type:(?:feature:): :message:${NC}"
  echo -e "where:"
  echo "  - :emoji: is one of the following:"
  echo "    - $emojisStringList"
  echo "  - :type: is one of the following:"
  echo "    - $typesStringList"
  echo "  - :feature: is optional and should be used for feature commits"
  echo "  - :message: is a short description of the changes in lowercase"
  echo ""
  echo "examples:"
  echo -e "${GREEN}✓${NC} 🐛 fix(auth): broken login button"
  echo -e "${GREEN}✓${NC} ✨ feat(profile): add new user page"
  echo -e "${GREEN}✓${NC} 🔥 chore(cleanup): remove deprecated code"
  echo -e "${GREEN}✓${NC} 📚 docs: update readme file"
  echo ""
  echo -e "please check our contributing guidelines: ${BLUE}https://docs.zymu.app/contributing/commits${NC}"
  echo ""
  echo -e "your commit message was:"
  echo -e "${YELLOW}$message${NC}"
  echo ""
  exit 1
fi

echo ""
exit 0
