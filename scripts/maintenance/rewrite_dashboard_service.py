import re

with open('src/dashboard/services/dashboardService.ts', 'r') as f:
    content = f.read()

# Add delay
if 'const delay = (ms: number)' not in content:
    content = content.replace('export interface RevenueData', 'const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));\n\nexport interface RevenueData')

# make methods async and add delay
def make_async(match):
    name = match.group(1)
    ret_type = match.group(2)
    body = match.group(3)
    if 'getTicketOverview' in name:
        return f"  {name}: async (): Promise<{ret_type}> => {{\n    await delay(300);\n    return {body};\n  }}"
    else:
        return f"  {name}: async (): Promise<{ret_type}> => {{\n    await delay(300);\n    return {body};\n  }}"

# Handle arrow functions without explicit return block
content = re.sub(r'  (\w+): \(\): (.*?) => (\[.*?\])(?=\n  \w+:|\n\},)', lambda m: f"  {m.group(1)}: async (): Promise<{m.group(2)}> => {{\n    await delay(300);\n    return {m.group(3)};\n  }}", content, flags=re.DOTALL)
content = re.sub(r'  getTicketOverview: \(\): (.*?) => (\(\{\n.*?\n  \}\))', lambda m: f"  getTicketOverview: async (): Promise<{m.group(1)}> => {{\n    await delay(300);\n    return {m.group(2)[1:-1]};\n  }}", content, flags=re.DOTALL)

with open('src/dashboard/services/dashboardService.ts', 'w') as f:
    f.write(content)
