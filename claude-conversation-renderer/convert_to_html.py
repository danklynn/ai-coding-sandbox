#!/usr/bin/env python3
"""
Claude Conversation Renderer

This script converts Claude Code conversation JSONL files into beautifully formatted HTML
with features like collapsible content, syntax highlighting, table of contents, and more.

Features:
- Converts JSONL conversation files to HTML with sidebar navigation
- Supports Claude API integration for enhanced summarization
- Includes collapsible long content and code blocks
- Generates table of contents from conversation milestones
- Caches API results to avoid redundant requests
- Responsive design for mobile and desktop viewing
"""

import json
import html
import re
from datetime import datetime
from pathlib import Path
import argparse
import requests
import os
import hashlib

def parse_timestamp(timestamp_str):
    """Parse ISO timestamp and return formatted string.
    
    Args:
        timestamp_str (str): ISO format timestamp string
        
    Returns:
        str: Formatted timestamp in 'YYYY-MM-DD HH:MM:SS' format
    """
    try:
        dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return timestamp_str

def clean_ansi_codes(text):
    """Remove ANSI color codes from text.
    
    Args:
        text (str): Text containing ANSI escape sequences
        
    Returns:
        str: Clean text with ANSI codes removed
    """
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

def format_tool_details(tool_data):
    """Format detailed tool usage information for HTML display.
    
    Creates collapsible tool usage sections with appropriate styling and icons
    based on the tool type (Read, Bash, etc.).
    
    Args:
        tool_data (dict): Tool data containing name and input parameters
        
    Returns:
        str: HTML string representing the formatted tool details
    """
    import uuid
    import os
    tool_name = tool_data.get('name', 'Unknown Tool')
    tool_input = tool_data.get('input', {})
    tool_id = f"tool_{uuid.uuid4().hex[:8]}"
    
    # For Read commands, show filename in the header
    header_text = f'🛠️ <strong>{tool_name}</strong>'
    if tool_name == 'Read' and 'file_path' in tool_input:
        filename = os.path.basename(tool_input['file_path'])
        header_text = f'📖 <strong>Read</strong> <span class="filename">{filename}</span>'
    elif tool_name == 'Bash' and 'command' in tool_input:
        command = tool_input['command']
        # Extract command name and check if full command fits on one line
        command_parts = command.split()
        command_name = command_parts[0] if command_parts else 'bash'
        
        # Show full command if it's short enough (under 50 chars and no newlines)
        if len(command) <= 50 and '\n' not in command:
            header_text = f'⚡ <strong>Bash</strong> <span class="command">{html.escape(command)}</span>'
        else:
            header_text = f'⚡ <strong>Bash</strong> <span class="command-name">{html.escape(command_name)}</span>'
    
    html_parts = [f'<div class="tool-header" onclick="toggleTool(\'{tool_id}\')">']
    html_parts.append(header_text)
    html_parts.append('<span class="tool-toggle">▶ Click to expand</span>')
    html_parts.append('</div>')
    
    if tool_input:
        html_parts.append(f'<div class="tool-details collapsed" id="{tool_id}">')
        for key, value in tool_input.items():
            if isinstance(value, str):
                escaped_value = html.escape(value)
                if key == 'command' and tool_name == 'Bash':
                    html_parts.append(f'<div class="tool-param"><strong>Command:</strong> <code>{escaped_value}</code></div>')
                elif key == 'description':
                    html_parts.append(f'<div class="tool-param"><strong>Description:</strong> {escaped_value}</div>')
                elif key == 'file_path':
                    html_parts.append(f'<div class="tool-param"><strong>File:</strong> <code>{escaped_value}</code></div>')
                else:
                    html_parts.append(f'<div class="tool-param"><strong>{key.title()}:</strong> {escaped_value}</div>')
            else:
                escaped_value = html.escape(str(value))
                html_parts.append(f'<div class="tool-param"><strong>{key.title()}:</strong> {escaped_value}</div>')
        html_parts.append('</div>')
    
    return ''.join(html_parts)

def count_lines_in_content(content):
    """Count the number of lines in content.
    
    Handles both string content and structured content arrays.
    
    Args:
        content (str or list): Content to count lines in
        
    Returns:
        int: Number of lines in the content
    """
    if isinstance(content, str):
        return len(content.split('\n'))
    elif isinstance(content, list):
        total_lines = 0
        for item in content:
            if isinstance(item, dict) and item.get('type') == 'text':
                total_lines += count_lines_in_content(item.get('text', ''))
        return total_lines
    return 0

def make_collapsible_if_long(content, formatted_content, is_assistant=False):
    """Make content collapsible if it's longer than 30 lines and from assistant.
    
    Creates a preview section with expand/collapse functionality for long content
    to improve readability and navigation.
    
    Args:
        content (str or list): Original content for line counting
        formatted_content (str): HTML-formatted content
        is_assistant (bool): Whether this is assistant content
        
    Returns:
        str: Either original content or collapsible HTML wrapper
    """
    if not is_assistant:
        return formatted_content
    
    line_count = count_lines_in_content(content)
    if line_count <= 30:
        return formatted_content
    
    # Create a unique ID for this collapsible section
    import uuid
    section_id = f"collapsible_{uuid.uuid4().hex[:8]}"
    
    # Get preview (first few lines)
    if isinstance(content, str):
        lines = content.split('\n')
        preview_lines = lines[:5]
        preview_text = '\n'.join(preview_lines)
        preview_formatted = format_content(preview_text)
    else:
        preview_formatted = formatted_content[:200] + "..."
    
    return f'''
    <div class="collapsible-container">
        <div class="content-preview" id="preview_{section_id}">
            {preview_formatted}
            <div class="content-summary">
                ... ({line_count} lines total)
                <button class="expand-btn" onclick="toggleContent('{section_id}')">Show All</button>
            </div>
        </div>
        <div class="content-full" id="full_{section_id}" style="display: none;">
            {formatted_content}
            <div class="content-controls">
                <button class="collapse-btn" onclick="toggleContent('{section_id}')">Show Less</button>
            </div>
        </div>
    </div>
    '''

def format_content(content):
    """Format message content for HTML display.
    
    Handles string content and structured content arrays. Processes code blocks,
    escapes HTML, and converts newlines to break tags.
    
    Args:
        content (str or list): Message content to format
        
    Returns:
        str: HTML-formatted content
    """
    if isinstance(content, str):
        # Clean ANSI codes and escape HTML
        clean_content = clean_ansi_codes(content)
        escaped_content = html.escape(clean_content)
        
        # Handle code blocks BEFORE converting newlines to <br> tags
        import uuid
        code_block_placeholders = {}
        
        def replace_code_block(match):
            language = match.group(1) or 'text'
            code_content = match.group(2)
            code_id = f"code_{uuid.uuid4().hex[:8]}"
            placeholder = f"__CODE_BLOCK_PLACEHOLDER_{code_id}__"
            
            code_block_html = f'''<div class="code-block-container">
<div class="code-header" onclick="toggleCodeBlock('{code_id}')">
<span class="code-language">{language}</span>
<span class="code-toggle">▼ Click to collapse</span>
</div>
<pre class="code-content" id="{code_id}"><code class="language-{language}">{code_content}</code></pre>
</div>'''
            
            code_block_placeholders[placeholder] = code_block_html
            return placeholder
        
        formatted_content = re.sub(r'```(\w+)?\n(.*?)\n```', 
                                 replace_code_block, 
                                 escaped_content, flags=re.DOTALL)
        
        # Convert newlines to <br> tags (after code block processing)
        formatted_content = formatted_content.replace('\n', '<br>')
        
        # Restore code blocks after <br> conversion
        for placeholder, code_html in code_block_placeholders.items():
            formatted_content = formatted_content.replace(placeholder, code_html)
        
        return formatted_content
    elif isinstance(content, list):
        # Handle structured content (like tool calls)
        formatted_parts = []
        for item in content:
            if isinstance(item, dict):
                if item.get('type') == 'text':
                    formatted_parts.append(format_content(item.get('text', '')))
                elif item.get('type') == 'tool_use':
                    formatted_parts.append(f'<div class="tool-use">{format_tool_details(item)}</div>')
            else:
                formatted_parts.append(format_content(str(item)))
        return '<br>'.join(formatted_parts)
    else:
        return html.escape(str(content))

def extract_message_content(message_data):
    """Extract the main content from a message.
    
    Handles different message data structures from the JSONL format.
    
    Args:
        message_data (dict): Message data from JSONL
        
    Returns:
        str or list: Message content
    """
    if 'message' in message_data and 'content' in message_data['message']:
        return message_data['message']['content']
    elif 'content' in message_data:
        return message_data['content']
    return ''

def get_message_role(message_data):
    """Determine the role/type of the message.
    
    Args:
        message_data (dict): Message data from JSONL
        
    Returns:
        str: Message role ('user', 'assistant', or 'system')
    """
    if 'message' in message_data and 'role' in message_data['message']:
        return message_data['message']['role']
    elif message_data.get('type') == 'assistant':
        return 'assistant'
    elif message_data.get('type') == 'user':
        return 'user'
    return 'system'

def is_meta_message(message_data):
    """Check if this is a meta/system message that should be styled differently.
    
    Args:
        message_data (dict): Message data from JSONL
        
    Returns:
        bool: True if this is a meta message
    """
    return message_data.get('isMeta', False) or 'command-name' in str(message_data)

def is_tool_result_message(message_data):
    """Check if this is a tool result message.
    
    Args:
        message_data (dict): Message data from JSONL
        
    Returns:
        bool: True if this contains tool result content
    """
    content = extract_message_content(message_data)
    if isinstance(content, list):
        for item in content:
            if isinstance(item, dict) and item.get('type') == 'tool_result':
                return True
    return False

def should_exclude_message(message_data):
    """Check if this message should be excluded from the HTML output.
    
    Filters out meta messages, tool results, and empty user messages.
    
    Args:
        message_data (dict): Message data from JSONL
        
    Returns:
        bool: True if message should be excluded
    """
    # Exclude meta messages
    if is_meta_message(message_data):
        return True
    
    # Exclude tool result messages
    if is_tool_result_message(message_data):
        return True
    
    # Exclude empty user messages
    if get_message_role(message_data) == 'user':
        content = extract_message_content(message_data)
        if not content or (isinstance(content, str) and not content.strip()):
            return True
    
    return False

def extract_text_from_content(content):
    """Extract text content from various message formats.
    
    Handles both string content and structured content arrays.
    
    Args:
        content (str or list): Content to extract text from
        
    Returns:
        str: Plain text content
    """
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        # Handle structured content like [{'type': 'text', 'text': '...'}, ...]
        text_parts = []
        for item in content:
            if isinstance(item, dict):
                if item.get('type') == 'text' and 'text' in item:
                    text_parts.append(item['text'])
                elif item.get('type') == 'image':
                    # Skip image content, but note it
                    text_parts.append('[Image]')
                elif item.get('type') == 'tool_use':
                    # Skip tool use content
                    continue
            else:
                text_parts.append(str(item))
        return ' '.join(text_parts)
    else:
        return str(content)

def extract_goal_from_text(text_content):
    """Extract the core goal or action from user text using regex patterns.
    
    Args:
        text_content (str): User message text
        
    Returns:
        str or None: Extracted goal/action, or None if no pattern matches
    """
    # Common action patterns
    action_patterns = [
        (r'(build|create|make) (.+?)(?:\.|$|,|\n)', r'\1 \2'),
        (r'(add|implement|write) (.+?)(?:\.|$|,|\n)', r'\1 \2'),
        (r'(fix|modify|update|change) (.+?)(?:\.|$|,|\n)', r'\1 \2'),
        (r'(convert|filter|exclude|show) (.+?)(?:\.|$|,|\n)', r'\1 \2'),
        (r'(generate|render) (.+?)(?:\.|$|,|\n)', r'\1 \2'),
        (r'(default|hide|collapse) (.+?)(?:\.|$|,|\n)', r'\1 \2'),
    ]
    
    text_lower = text_content.lower()
    for pattern, replacement in action_patterns:
        match = re.search(pattern, text_lower)
        if match:
            goal = re.sub(pattern, replacement, text_lower).strip()
            # Clean up and capitalize
            goal = re.sub(r'\s+', ' ', goal)
            goal = goal.capitalize()
            if len(goal) > 60:
                goal = goal[:57] + "..."
            return goal
    
    return None

def get_file_hash(file_path):
    """Generate MD5 hash of file contents for cache key.
    
    Args:
        file_path (str): Path to file
        
    Returns:
        str: MD5 hash of file contents
    """
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def get_cache_file_path(input_file):
    """Generate cache file path based on input file hash.
    
    Creates a cache directory if it doesn't exist.
    
    Args:
        input_file (str): Path to input JSONL file
        
    Returns:
        Path: Path to cache file
    """
    file_hash = get_file_hash(input_file)
    cache_dir = Path(input_file).parent / ".conversation_cache"
    cache_dir.mkdir(exist_ok=True)
    return cache_dir / f"summaries_{file_hash}.json"

def load_summary_cache(input_file):
    """Load cached summaries if they exist.
    
    Args:
        input_file (str): Path to input JSONL file
        
    Returns:
        dict: Cached summaries or empty dict if cache doesn't exist
    """
    cache_file = get_cache_file_path(input_file)
    if cache_file.exists():
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Failed to load cache: {e}")
    return {}

def save_summary_cache(input_file, cache):
    """Save summaries to cache file.
    
    Args:
        input_file (str): Path to input JSONL file
        cache (dict): Summary cache to save
    """
    cache_file = get_cache_file_path(input_file)
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Warning: Failed to save cache: {e}")

def summarize_with_claude(text_content, api_key, cache_key=None, cache=None):
    """Use Claude API to generate a concise summary with caching.
    
    Makes API calls to Claude to generate better summaries than regex patterns.
    Includes caching to avoid redundant API calls.
    
    Args:
        text_content (str): Text to summarize
        api_key (str): Anthropic API key
        cache_key (str, optional): Cache key for this content
        cache (dict, optional): Cache dictionary
        
    Returns:
        str or None: Generated summary or None if API fails
    """
    # Check cache first
    if cache_key and cache and cache_key in cache:
        return cache[cache_key]
    
    if not api_key:
        return None
    
    try:
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01'
        }
        
        # Detect if this is asking for user request or assistant accomplishment
        if text_content.startswith("Summarize what the assistant accomplished"):
            prompt = text_content
        else:
            prompt = f"""Summarize the application changes that the user wanted to accomplissh in 5-10 words focusing on the main goal or action. Be very concise.

User message: {text_content[:500]}

Summary:"""
        
        data = {
            'model': 'claude-sonnet-4-20250514',
            'max_tokens': 128,
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ]
        }
        
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            summary = result['content'][0]['text'].strip()
            # Clean up the summary
            summary = re.sub(r'^(Summary:|Action:|Goal:|Accomplished:)\s*', '', summary, flags=re.IGNORECASE)
            summary = summary.strip('"\'')
            summary = summary[:60]  # Limit length
            
            # Cache the result
            if cache_key and cache is not None:
                cache[cache_key] = summary
            
            return summary
        
    except Exception as e:
        print(f"Warning: Claude API error: {e}")
    
    return None

def extract_meaningful_summary(content, role, api_key=None, cache_key=None, cache=None):
    """Extract a meaningful summary from message content.
    
    Uses Claude API for better summarization if available, falls back to
    regex pattern matching.
    
    Args:
        content (str or list): Message content
        role (str): Message role ('user' or 'assistant')
        api_key (str, optional): Anthropic API key
        cache_key (str, optional): Cache key for this content
        cache (dict, optional): Cache dictionary
        
    Returns:
        str or None: Extracted summary or None if no meaningful content
    """
    # First convert to text
    text_content = extract_text_from_content(content)
    
    if not text_content or not text_content.strip():
        return None
    
    text_content = text_content.strip()
    
    # Skip if it's just raw JSON or data
    if text_content.startswith('[{') or text_content.startswith('{"') or len(text_content) > 500:
        return None
    
    # Skip if it's just an image reference
    if text_content == '[Image]' or text_content.startswith('[Image'):
        return None
    
    if role == 'user':
        # Try Claude API first if available
        if api_key:
            claude_summary = summarize_with_claude(text_content, api_key, cache_key, cache)
            if claude_summary:
                return claude_summary
        
        # Fallback to regex-based extraction
        goal = extract_goal_from_text(text_content)
        if goal:
            return goal
        
        # Final fallback: extract first sentence and simplify
        first_sentence = text_content.split('.')[0].strip()
        if len(first_sentence) > 60:
            first_sentence = first_sentence[:57] + "..."
        return first_sentence
    
    elif role == 'assistant':
        # For assistant messages, try to extract specific accomplishments
        
        # Use Claude API for better summarization if available
        if api_key:
            prompt_text = f"Summarize what the assistant accomplished in 2-4 words: {text_content[:400]}"
            claude_summary = summarize_with_claude(prompt_text, api_key, cache_key, cache)
            if claude_summary and claude_summary.lower() not in ['task completed', 'completed task', 'done']:
                return claude_summary
        
        # Fallback to pattern matching
        text_lower = text_content.lower()
        
        # Look for file operations
        if 'file created' in text_lower or 'created successfully' in text_lower:
            return "Created file"
        if 'updated' in text_lower and any(word in text_lower for word in ['script', 'file', 'code']):
            return "Updated code"
        if 'fixed' in text_lower:
            return "Fixed issue"
        if 'added' in text_lower and any(word in text_lower for word in ['feature', 'functionality', 'support']):
            return "Added feature"
        if 'implemented' in text_lower:
            return "Implemented feature"
        if 'converted' in text_lower:
            return "Converted format"
        
        # Look for specific technical accomplishments
        if any(word in text_lower for word in ['collapsible', 'collapse', 'expand']):
            return "Added collapsible UI"
        if any(word in text_lower for word in ['filter', 'exclude', 'remove']):
            return "Filtered content"
        if 'table of contents' in text_lower or 'milestone' in text_lower:
            return "Added navigation"
        if any(word in text_lower for word in ['api', 'integration']):
            return "Integrated API"
        
        # Generic completion - try to avoid this
        return None
    
    return None

def identify_milestones(messages, api_key=None, input_file=None):
    """Identify key milestones in the conversation for table of contents.
    
    Scans through messages to find significant user requests and completions
    to build a navigable table of contents.
    
    Args:
        messages (list): List of conversation messages
        api_key (str, optional): Anthropic API key for enhanced summarization
        input_file (str, optional): Input file path for caching
        
    Returns:
        list: List of milestone dictionaries with titles and positions
    """
    milestones = []
    last_milestone_index = -10  # Ensure some spacing between milestones
    
    # Load summary cache
    cache = {}
    if input_file:
        cache = load_summary_cache(input_file)
        print(f"Loaded {len(cache)} cached summaries from {get_cache_file_path(input_file)}")
    
    cache_updated = False
    
    for i, message in enumerate(messages):
        role = get_message_role(message)
        content = extract_message_content(message)
        
        # Skip if too close to last milestone
        if i - last_milestone_index < 5:
            continue
        
        summary = None
        milestone_type = None
        
        # Create cache key based on message content and role
        cache_key = None
        content_text = extract_text_from_content(content)
        if content_text and len(content_text.strip()) > 0:
            cache_key = f"{role}_{hashlib.md5(content_text.encode()).hexdigest()[:16]}"
        
        if role == 'user':
            content_str = str(content).lower()
            # Look for significant development requests
            if any(keyword in content_str for keyword in [
                'build', 'create', 'implement', 'add', 'fix', 'modify', 'update', 
                'write', 'make', 'generate', 'convert', 'filter', 'exclude', 'show'
            ]):
                summary = extract_meaningful_summary(content, role, api_key, cache_key, cache)
                if summary:
                    milestone_type = 'user_request'
                    # Update cache if we have a cache key and the summary wasn't from cache
                    if cache_key and (api_key or cache_key not in cache):
                        if cache_key not in cache:
                            cache[cache_key] = summary
                            cache_updated = True
        
        elif role == 'assistant':
            content_str = str(content).lower()
            # Look for completions, file operations, or significant updates
            if any(keyword in content_str for keyword in [
                'successfully', 'completed', 'created', 'implemented', 'added', 'fixed', 
                'built', 'updated', 'modified', 'converted', 'perfect', 'done'
            ]):
                summary = extract_meaningful_summary(content, role, api_key, cache_key, cache)
                if summary:
                    milestone_type = 'completion'
                    # Update cache if we have a cache key and the summary wasn't from cache
                    if cache_key and (api_key or cache_key not in cache):
                        if cache_key not in cache:
                            cache[cache_key] = summary
                            cache_updated = True
        
        if summary and milestone_type:
            timestamp = message.get('timestamp', '')
            milestones.append({
                'index': i,
                'title': summary,
                'type': milestone_type,
                'timestamp': timestamp
            })
            last_milestone_index = i
    
    # Save updated cache
    if input_file:
        if cache_updated:
            save_summary_cache(input_file, cache)
            print(f"Saved {len(cache)} summaries to cache")
        else:
            print("No cache updates needed")
    
    # Limit to most significant milestones
    if len(milestones) > 12:
        # Keep every nth milestone to get around 12 total
        step = len(milestones) // 12
        milestones = milestones[::max(1, step)]
    
    return milestones

def convert_jsonl_to_html(input_file, output_file=None, api_key=None):
    """Convert JSONL conversation file to HTML.
    
    Main conversion function that processes the JSONL file, identifies milestones,
    and generates a complete HTML document with styling and navigation.
    
    Args:
        input_file (str): Path to input JSONL file
        output_file (str, optional): Path to output HTML file
        api_key (str, optional): Anthropic API key for enhanced summarization
        
    Returns:
        str: Path to generated HTML file
    """
    
    if output_file is None:
        # Always use the same output filename based on input
        output_file = Path(input_file).parent / f"{Path(input_file).stem}_conversation.html"
    
    messages = []
    
    # Read and parse JSONL file
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    message = json.loads(line)
                    # Filter out meta messages and empty user messages
                    if not should_exclude_message(message):
                        messages.append(message)
                except json.JSONDecodeError as e:
                    print(f"Warning: Failed to parse line: {e}")
                    continue
    
    # Identify milestones for table of contents
    if api_key:
        print("Using Claude API for enhanced summarization...")
    milestones = identify_milestones(messages, api_key, input_file)
    
    # Generate HTML
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Conversation - {Path(input_file).stem}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            display: flex;
            min-height: 100vh;
        }}
        
        .container {{
            display: flex;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
        }}
        
        .conversation {{
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-top: 0;
        }}
        
        .message {{
            padding: 20px;
            border-bottom: 1px solid #eee;
            margin-bottom: 0;
        }}
        
        .message:last-child {{
            border-bottom: none;
        }}
        
        .message.user {{
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
        }}
        
        .message.assistant {{
            background-color: #fff;
            border-left: 4px solid #28a745;
        }}
        
        .message.system {{
            background-color: #fff8dc;
            border-left: 4px solid #ffc107;
            font-size: 0.9em;
        }}
        
        .message.meta {{
            background-color: #f0f0f0;
            border-left: 4px solid #6c757d;
            font-size: 0.85em;
            color: #666;
        }}
        
        .message-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-size: 0.9em;
            color: #666;
        }}
        
        .role {{
            font-weight: bold;
            text-transform: capitalize;
        }}
        
        .role.user {{
            color: #007bff;
        }}
        
        .role.assistant {{
            color: #28a745;
        }}
        
        .role.system {{
            color: #ffc107;
        }}
        
        .timestamp {{
            font-size: 0.8em;
            color: #999;
        }}
        
        .content {{
            word-wrap: break-word;
            white-space: pre-wrap;
        }}
        
        .tool-use {{
            background-color: #e9ecef;
            padding: 12px;
            border-radius: 6px;
            margin: 12px 0;
            border-left: 3px solid #6c757d;
        }}
        
        .tool-header {{
            font-size: 0.95em;
            color: #495057;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            user-select: none;
            transition: background-color 0.2s;
        }}
        
        .tool-header:hover {{
            background-color: #f1f3f4;
        }}
        
        .tool-toggle {{
            font-size: 0.8em;
            color: #007bff;
        }}
        
        .filename {{
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background-color: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            border: 1px solid #dee2e6;
            font-size: 0.9em;
            color: #495057;
            margin-left: 8px;
        }}
        
        .command, .command-name {{
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background-color: #2d3748;
            color: #e2e8f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.85em;
            margin-left: 8px;
        }}
        
        .command-name {{
            background-color: #4a5568;
            color: #cbd5e0;
        }}
        
        .tool-details {{
            margin-left: 20px;
            padding: 12px;
            transition: max-height 0.3s ease-out;
        }}
        
        .tool-details.collapsed {{
            max-height: 0;
            overflow: hidden;
            padding: 0 12px;
        }}
        
        .tool-param {{
            margin: 4px 0;
            font-size: 0.9em;
        }}
        
        .tool-param code {{
            background-color: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            border: 1px solid #dee2e6;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }}
        
        .collapsible-container {{
            border: 1px solid #e9ecef;
            border-radius: 6px;
            margin: 10px 0;
        }}
        
        .content-preview {{
            position: relative;
        }}
        
        .content-summary {{
            background: linear-gradient(transparent, #f8f9fa);
            padding: 15px 10px 10px;
            margin-top: 10px;
            border-top: 1px solid #e9ecef;
            font-size: 0.9em;
            color: #6c757d;
            text-align: center;
        }}
        
        .expand-btn, .collapse-btn {{
            background-color: #007bff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
            margin-left: 10px;
            transition: background-color 0.2s;
        }}
        
        .expand-btn:hover, .collapse-btn:hover {{
            background-color: #0056b3;
        }}
        
        .content-controls {{
            text-align: center;
            padding: 10px;
            border-top: 1px solid #e9ecef;
            background-color: #f8f9fa;
        }}
        
        .content-full {{
            border-radius: 0 0 6px 6px;
        }}
        
        .code-block-container {{
            margin: 10px 0;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            overflow: hidden;
        }}
        
        .code-header {{
            background-color: #f8f9fa;
            padding: 8px 12px;
            border-bottom: 1px solid #e9ecef;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            transition: background-color 0.2s;
        }}
        
        .code-header:hover {{
            background-color: #e9ecef;
        }}
        
        .code-language {{
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.85em;
            color: #6c757d;
            text-transform: uppercase;
        }}
        
        .code-toggle {{
            font-size: 0.8em;
            color: #007bff;
        }}
        
        .code-content {{
            margin: 0;
            transition: max-height 0.3s ease-out;
        }}
        
        .code-content.collapsed {{
            max-height: 0;
            overflow: hidden;
        }}
        
        pre {{
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            border: 1px solid #e9ecef;
        }}
        
        code {{
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
        }}
        
        
        h1 {{
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }}
        
        .sidebar {{
            width: 320px;
            background-color: #f8f9fa;
            border-right: 1px solid #e9ecef;
            padding: 20px;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            flex-shrink: 0;
        }}
        
        .main-content {{
            flex: 1;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        
        .table-of-contents {{
            background-color: transparent;
            border: none;
            border-radius: 0;
            padding: 0;
            margin-bottom: 0;
        }}
        
        .table-of-contents h3 {{
            margin-top: 0;
            margin-bottom: 20px;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
            padding-bottom: 12px;
            font-size: 1.2em;
        }}
        
        .toc-content {{
            max-height: none;
            overflow-y: visible;
        }}
        
        .toc-item {{
            margin-bottom: 8px;
        }}
        
        .toc-link {{
            display: flex;
            align-items: flex-start;
            padding: 8px 12px;
            text-decoration: none;
            color: #495057;
            border-radius: 4px;
            transition: background-color 0.2s;
        }}
        
        .toc-link:hover {{
            background-color: #e9ecef;
            text-decoration: none;
            color: #495057;
        }}
        
        .toc-icon {{
            margin-right: 10px;
            font-size: 1.1em;
            margin-top: 2px;
        }}
        
        .toc-content-wrapper {{
            flex: 1;
            display: flex;
            flex-direction: column;
        }}
        
        .toc-title {{
            font-size: 0.9em;
            line-height: 1.3;
            margin-bottom: 2px;
        }}
        
        .toc-timestamp {{
            font-size: 0.75em;
            color: #6c757d;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }}
        
        .toc-empty {{
            color: #6c757d;
            font-style: italic;
            text-align: center;
            margin: 20px 0;
        }}
        
        /* Responsive design */
        @media (max-width: 768px) {{
            .container {{
                flex-direction: column;
            }}
            
            .sidebar {{
                width: 100%;
                height: auto;
                position: static;
                border-right: none;
                border-bottom: 1px solid #e9ecef;
                max-height: 300px;
                overflow-y: auto;
            }}
            
            .main-content {{
                padding: 15px;
            }}
            
            .table-of-contents h3 {{
                font-size: 1.1em;
                margin-bottom: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="table-of-contents">
                <h3>📋 Development Timeline</h3>
                <div class="toc-content">"""

    # Generate table of contents for sidebar - only show user requests
    user_milestones = [m for m in milestones if m['type'] == 'user_request']
    if user_milestones:
        for milestone in user_milestones:
            formatted_timestamp = parse_timestamp(milestone.get('timestamp', ''))            
            html_content += f'''
                <div class="toc-item">
                    <a href="#message-{milestone['index']}" class="toc-link">
                        <span class="toc-icon">💬</span>
                        <div class="toc-content-wrapper">
                            <span class="toc-title">{html.escape(milestone['title'])}</span>
                            <span class="toc-timestamp">{formatted_timestamp}</span>
                        </div>
                    </a>
                </div>'''
    else:
        html_content += '<p class="toc-empty">No significant milestones detected in this conversation.</p>'
    
    html_content += """
                </div>
            </div>
        </div>
        
        <div class="main-content">
            <h1>Claude Conversation History</h1>
            <div class="conversation">
"""
    
    for i, message in enumerate(messages):
        role = get_message_role(message)
        content = extract_message_content(message)
        timestamp = parse_timestamp(message.get('timestamp', ''))
        uuid = message.get('uuid', '')
        is_meta = is_meta_message(message)
        
        # Determine message class
        message_class = 'meta' if is_meta else role
        
        # Format content and make collapsible if needed
        formatted_content = format_content(content)
        is_assistant = (role == 'assistant')
        final_content = make_collapsible_if_long(content, formatted_content, is_assistant)
        
        html_content += f"""
        <div class="message {message_class}" id="message-{i}">
            <div class="message-header">
                <span class="role {role}">{'Meta' if is_meta else role.title()}</span>
                <span class="timestamp">{timestamp}</span>
            </div>
            <div class="content">{final_content}</div>
        </div>
"""
    
    html_content += """
        </div>
    </div>
</div>
    
    <script>
    function toggleContent(sectionId) {
        const preview = document.getElementById('preview_' + sectionId);
        const full = document.getElementById('full_' + sectionId);
        
        if (full.style.display === 'none') {
            // Show full content
            preview.style.display = 'none';
            full.style.display = 'block';
        } else {
            // Show preview
            preview.style.display = 'block';
            full.style.display = 'none';
        }
    }
    
    function toggleCodeBlock(codeId) {
        const codeContent = document.getElementById(codeId);
        const toggleSpan = codeContent.parentElement.querySelector('.code-toggle');
        
        if (codeContent.classList.contains('collapsed')) {
            // Expand code block
            codeContent.classList.remove('collapsed');
            toggleSpan.textContent = '▼ Click to collapse';
        } else {
            // Collapse code block
            codeContent.classList.add('collapsed');
            toggleSpan.textContent = '▶ Click to expand';
        }
    }
    
    function toggleTool(toolId) {
        const toolDetails = document.getElementById(toolId);
        const toggleSpan = toolDetails.parentElement.querySelector('.tool-toggle');
        
        if (toolDetails.classList.contains('collapsed')) {
            // Expand tool details
            toolDetails.classList.remove('collapsed');
            toggleSpan.textContent = '▼ Click to collapse';
        } else {
            // Collapse tool details
            toolDetails.classList.add('collapsed');
            toggleSpan.textContent = '▶ Click to expand';
        }
    }
    </script>
</body>
</html>"""
    
    # Write HTML file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Converted {len(messages)} messages to {output_file}")
    return output_file

def main():
    parser = argparse.ArgumentParser(
        description='Claude Conversation Renderer - Convert Claude Code JSONL files to beautiful HTML',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s conversation.jsonl
  %(prog)s conversation.jsonl -o output.html
  %(prog)s conversation.jsonl --api-key sk-ant-xxxxx

Claude API Key:
  For enhanced summarization and table of contents generation, provide your
  Anthropic API key using one of these methods:
  
  1. Command line argument: --api-key sk-ant-xxxxx
  2. Environment variable: export ANTHROPIC_API_KEY=sk-ant-xxxxx
  
  To get an API key:
  1. Sign up at https://console.anthropic.com/
  2. Go to Settings > API Keys
  3. Create a new API key
  4. Copy the key (starts with 'sk-ant-')
  
  Note: The API key is optional. Without it, the script will use basic
  pattern matching for summarization instead of Claude's enhanced analysis.

Features:
  - Responsive HTML with sidebar navigation
  - Collapsible long content and code blocks  
  - Syntax highlighting for code
  - Table of contents from conversation milestones
  - Caching to avoid redundant API calls
  - Clean, modern design optimized for readability
        ''')
    parser.add_argument('input_file', 
                        help='Path to the Claude Code JSONL conversation file')
    parser.add_argument('-o', '--output', 
                        help='Output HTML file path (default: <input>_conversation.html)')
    parser.add_argument('--api-key', 
                        help='Anthropic API key for enhanced summarization (optional, can also use ANTHROPIC_API_KEY env var)')
    
    args = parser.parse_args()
    
    if not Path(args.input_file).exists():
        print(f"Error: Input file '{args.input_file}' does not exist")
        return 1
    
    try:
        # Get API key from environment or argument
        api_key = os.getenv('ANTHROPIC_API_KEY') or getattr(args, 'api_key', None)
        
        output_file = convert_jsonl_to_html(args.input_file, args.output, api_key)
        print(f"Successfully converted conversation to {output_file}")
        return 0
    except Exception as e:
        print(f"Error: {e}")
        return 1

if __name__ == '__main__':
    exit(main())