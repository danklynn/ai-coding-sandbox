# Claude Conversation Renderer

Convert Claude Code conversation JSONL files into beautifully formatted HTML documents with advanced features like collapsible content, syntax highlighting, and intelligent table of contents.

## Features

- 🎨 **Beautiful HTML Output**: Clean, modern design optimized for readability
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🔍 **Smart Navigation**: Auto-generated table of contents from conversation milestones
- 📝 **Code Highlighting**: Syntax highlighting for code blocks with collapsible sections
- 🤖 **AI-Enhanced Summaries**: Optional Claude API integration for intelligent summarization
- ⚡ **Performance Optimized**: Caching system to avoid redundant API calls
- 🛠️ **Tool Visualization**: Clear display of tool usage with expandable details

## Quick Start

### Basic Usage

```bash
python convert_to_html.py conversation.jsonl
```

This will create a file named `conversation_conversation.html` in the same directory.

### With Custom Output

```bash
python convert_to_html.py conversation.jsonl -o my_conversation.html
```

### With Enhanced Summarization

For best results, use your Anthropic API key:

```bash
python convert_to_html.py conversation.jsonl --api-key sk-ant-xxxxx
```

Or set the environment variable:

```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxx
python convert_to_html.py conversation.jsonl
```

## Getting an API Key

To enable enhanced summarization features:

1. **Sign up** at [https://console.anthropic.com/](https://console.anthropic.com/)
2. **Navigate** to Settings > API Keys  
3. **Create** a new API key
4. **Copy** the key (starts with 'sk-ant-')

> **Note**: The API key is optional. Without it, the script uses basic pattern matching for summarization instead of Claude's enhanced analysis.

## Installation

### Requirements

- Python 3.7+
- Required packages: `requests`, `argparse`, `pathlib`, `json`, `html`, `re`, `datetime`, `hashlib`

### Install Dependencies

```bash
pip install requests
```

Most other dependencies are part of Python's standard library.

## How It Works

1. **Parse JSONL**: Reads and processes the Claude Code conversation file
2. **Filter Content**: Removes meta messages and tool results for cleaner output  
3. **Identify Milestones**: Scans for significant user requests and completions
4. **Generate Summaries**: Uses Claude API or pattern matching to create concise summaries
5. **Build HTML**: Creates responsive HTML with navigation, styling, and interactivity
6. **Cache Results**: Saves API results to avoid redundant calls on re-runs

## Output Features

### Sidebar Navigation
- **Development Timeline**: Shows key milestones from the conversation
- **Quick Jump**: Click any milestone to jump to that part of the conversation
- **Timestamps**: Each milestone shows when it occurred

### Message Display
- **Role-based Styling**: Different colors for user, assistant, and system messages
- **Collapsible Content**: Long assistant responses automatically collapse with preview
- **Tool Usage**: Clear visualization of tool calls with expandable details
- **Code Blocks**: Syntax highlighting with collapsible sections

### Responsive Design
- **Mobile Friendly**: Sidebar becomes collapsible on small screens
- **Clean Typography**: Optimized for reading long conversations
- **Print Friendly**: Styles work well for printing or PDF export

## Command Line Options

```
usage: convert_to_html.py [-h] [-o OUTPUT] [--api-key API_KEY] input_file

positional arguments:
  input_file            Path to the Claude Code JSONL conversation file

optional arguments:
  -h, --help            Show this help message and exit
  -o OUTPUT, --output OUTPUT
                        Output HTML file path (default: <input>_conversation.html)
  --api-key API_KEY     Anthropic API key for enhanced summarization
```

## Examples

### Convert a single conversation
```bash
python convert_to_html.py my_coding_session.jsonl
```

### Batch convert multiple files
```bash
for file in *.jsonl; do
    python convert_to_html.py "$file"
done
```

### Use with environment variable
```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxx
python convert_to_html.py conversation.jsonl
```

## Caching

The script automatically caches API responses in a `.conversation_cache` directory to:
- Avoid redundant API calls when re-running on the same file
- Speed up subsequent conversions
- Reduce API costs

Cache files are named based on the input file's content hash, so they're automatically invalidated when the source file changes.

## File Structure

```
your-project/
├── conversation.jsonl          # Input JSONL file
├── convert_to_html.py         # Main script
├── conversation_conversation.html  # Generated HTML
└── .conversation_cache/       # API response cache
    └── summaries_abc123.json
```

## Troubleshooting

### Common Issues

**"File not found" error**
- Ensure the JSONL file path is correct
- Check that the file exists and is readable

**API key not working**
- Verify your API key starts with 'sk-ant-'
- Check that your account has API access enabled
- Ensure you have sufficient API credits

**Empty or broken HTML output**
- Check that the JSONL file contains valid conversation data
- Verify the file isn't corrupted or truncated

### Getting Help

For issues or feature requests, please check the existing issues or create a new one in the repository.

## License

This project is open source. See the LICENSE file for details.