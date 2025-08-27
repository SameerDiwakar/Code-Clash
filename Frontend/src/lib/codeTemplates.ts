/**
 * Generates language-specific boilerplate code for coding problems
 * @param language - The programming language
 * @param functionName - Name of the function to implement
 * @param params - Array of parameter names with their types
 * @param returnType - Return type of the function
 * @param examples - Array of example input/output pairs
 * @returns String containing the boilerplate code
 */
export function generateBoilerplate(
  language: string,
  functionName: string,
  params: { name: string; type: string }[],
  returnType: string,
  examples: { input: string; output: string }[]
): string {
  const templates: Record<string, string> = {
    'c++': generateCppBoilerplate(functionName, params, returnType, examples),
    'java': generateJavaBoilerplate(functionName, params, returnType, examples),
    'python': generatePythonBoilerplate(functionName, params, returnType, examples),
    'javascript': generateJavascriptBoilerplate(functionName, params, returnType, examples)
  };

  return templates[language.toLowerCase()] || `// No template available for ${language}`;
}

function generateCppBoilerplate(
  functionName: string,
  params: { name: string; type: string }[],
  returnType: string,
  examples: { input: string; output: string }[]
): string {
  const paramList = params.map(p => `const ${p.type}& ${p.name}`).join(', ');
  const paramNames = params.map(p => p.name).join(', ');
  
  // Simple input reading for C++
  let inputRead = '';
  if (params.length > 0) {
    inputRead = '    // Read input\n';
    inputRead += '    std::string line;\n';
    inputRead += '    std::getline(std::cin, line);\n';
    inputRead += '    std::istringstream iss(line);\n';
    
    params.forEach((p, i) => {
      if (p.type.includes('vector')) {
        inputRead += `    std::vector<int> ${p.name};\n`;
        inputRead += `    int num;\n`;
        inputRead += `    while (iss >> num) {\n`;
        inputRead += `        ${p.name}.push_back(num);\n`;
        inputRead += `        if (iss.peek() == ',') iss.ignore();\n`;
        inputRead += `    }\n`;
        inputRead += `    iss.clear();\n`;
      } else {
        inputRead += `    ${p.type} ${p.name};\n`;
        inputRead += `    iss >> ${p.name};\n`;
      }
    });
  }
  
  return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>

${returnType} ${functionName}(${paramList}) {
    // Your implementation here
    
}

// DO NOT CHANGE THE MAIN FUNCTION
int main() {
${inputRead}
    
    ${returnType} result = ${functionName}(${paramNames});
    
    // Print the result based on return type
    if constexpr (std::is_same_v<${returnType}, bool>) {
        std::cout << (result ? "true" : "false");
    } else if constexpr (std::is_same_v<${returnType}, std::string>) {
        std::cout << result;
    } else if constexpr (std::is_same_v<${returnType}, std::vector<int>>) {
        std::cout << "[";
        for (int i = 0; i < result.size(); ++i) {
            std::cout << result[i];
            if (i < result.size() - 1) std::cout << ",";
        }
        std::cout << "]";
    } else {
        std::cout << result;
    }
    std::cout << std::endl;
    
    return 0;
}
`;
}

function generateJavaBoilerplate(
  functionName: string,
  params: { name: string; type: string }[],
  returnType: string,
  examples: { input: string; output: string }[]
): string {
  const paramList = params.map(p => `${p.type} ${p.name}`).join(', ');
  const paramNames = params.map(p => p.name).join(', ');
  
  // Generate input reading code
  let inputRead = '';
  if (params.length > 0) {
    inputRead = '        // Read input\n';
    inputRead += '        String[] input = scanner.nextLine().split("\\\\s+");\n';
    inputRead += '        int idx = 0;\n\n';
    
    params.forEach((p, i) => {
      if (p.type === 'int') {
        inputRead += `        int ${p.name} = Integer.parseInt(input[idx++]);\n`;
      } else if (p.type === 'String') {
        inputRead += `        String ${p.name} = input[idx++];\n`;
      } else if (p.type === 'int[]') {
        inputRead += `        int n = Integer.parseInt(input[idx++]);\n`;
        inputRead += `        int[] ${p.name} = new int[n];\n`;
        inputRead += `        for (int i = 0; i < n; i++) {\n            ${p.name}[i] = Integer.parseInt(input[idx++]);\n        }\n`;
      } else if (p.type === 'List<String>') {
        inputRead += `        int n = Integer.parseInt(input[idx++]);\n`;
        inputRead += `        List<String> ${p.name} = new ArrayList<>();\n`;
        inputRead += `        for (int i = 0; i < n; i++) {\n            ${p.name}.add(input[idx++]);\n        }\n`;
      } else if (p.type === 'List<Integer>') {
        inputRead += `        int n = Integer.parseInt(input[idx++]);\n`;
        inputRead += `        List<Integer> ${p.name} = new ArrayList<>();\n`;
        inputRead += `        for (int i = 0; i < n; i++) {\n            ${p.name}.add(Integer.parseInt(input[idx++]));\n        }\n`;
      }
    });
  }
  
  return `import java.util.*;

public class Solution {
    public static ${returnType} ${functionName}(${paramList}) {
        // Your implementation here
        
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
${inputRead}
        
        // Call the function
        ${returnType} result = ${functionName}(${paramNames});
        
        // Print the result
        if (result instanceof int[]) {
            System.out.println(Arrays.toString((int[]) result));
        } else if (result instanceof List) {
            System.out.println(result);
        } else {
            System.out.println(result);
        }
        
        scanner.close();
    }
}`;
}

function generatePythonBoilerplate(
  functionName: string,
  params: { name: string; type: string }[],
  returnType: string,
  examples: { input: string; output: string }[]
): string {
  const paramList = params.map(p => p.name).join(', ');
  
  // Generate input reading code
  let inputRead = '';
  if (params.length > 0) {
    inputRead = '    # Read input\n';
    inputRead += '    import sys\n';
    inputRead += '    data = list(sys.stdin.read().split())\n';
    inputRead += '    idx = 0\n\n';
    
    params.forEach((p, i) => {
      if (p.type === 'int') {
        inputRead += `    ${p.name} = int(data[idx])\n`;
        inputRead += `    idx += 1\n`;
      } else if (p.type === 'str') {
        inputRead += `    ${p.name} = data[idx]\n`;
        inputRead += `    idx += 1\n`;
      } else if (p.type === 'List[int]') {
        inputRead += `    n = int(data[idx])\n`;
        inputRead += `    idx += 1\n`;
        inputRead += `    ${p.name} = list(map(int, data[idx:idx+n]))\n`;
        inputRead += `    idx += n\n`;
      } else if (p.type === 'List[str]') {
        inputRead += `    n = int(data[idx])\n`;
        inputRead += `    idx += 1\n`;
        inputRead += `    ${p.name} = data[idx:idx+n]\n`;
        inputRead += `    idx += n\n`;
      }
    });
  }
  
  return `from typing import List, Optional

def ${functionName}(${paramList}) -> ${returnType}:
    # Your implementation here
    pass

if __name__ == "__main__":
${inputRead}
    
    # Call the function
    result = ${functionName}(${paramList})
    
    # Print the result
    if isinstance(result, list):
        print("[" + ",".join(map(str, result)) + "]")
    elif isinstance(result, bool):
        print(str(result).lower())
    else:
        print(result)
`;
}

function generateJavascriptBoilerplate(
  functionName: string,
  params: { name: string; type: string }[],
  returnType: string,
  examples: { input: string; output: string }[]
): string {
  const paramList = params.map(p => p.name).join(', ');
  
  // Generate input reading code
  let inputRead = '';
  if (params.length > 0) {
    inputRead = '    // Read input\n';
    inputRead += '    const readline = require(\'readline\');\n';
    inputRead += '    const rl = readline.createInterface({\n        input: process.stdin,\n        output: process.stdout\n    });\n\n';
    inputRead += '    const input = [];\n';
    inputRead += '    rl.on(\'line\', line => {\n';
    inputRead += '        input.push(...line.trim().split(/\\s+/));\n';
    inputRead += '    });\n\n';
    inputRead += '    rl.on(\'close\', () => {\n';
    
    let idx = 0;
    params.forEach((p, i) => {
      if (p.type === 'number') {
        inputRead += `        const ${p.name} = parseInt(input[${i}]);\n`;
      } else if (p.type === 'string') {
        inputRead += `        const ${p.name} = input[${i}];\n`;
      } else if (p.type === 'number[]') {
        inputRead += `        const n = parseInt(input[${idx++}]);\n`;
        inputRead += `        const ${p.name} = [];\n`;
        inputRead += `        for (let i = 0; i < n; i++) {\n            ${p.name}.push(parseInt(input[${idx++}]));\n        }\n`;
      } else if (p.type === 'string[]') {
        inputRead += `        const n = parseInt(input[${idx++}]);\n`;
        inputRead += `        const ${p.name} = [];\n`;
        inputRead += `        for (let i = 0; i < n; i++) {\n            ${p.name}.push(input[${idx++}]);\n        }\n`;
      }
    });
    
    inputRead += '\n        // Call the function\n';
    inputRead += `        const result = ${functionName}(${paramList});\n\n`;
    inputRead += '        // Print the result\n';
    inputRead += '        if (Array.isArray(result)) {\n';
    inputRead += '            console.log(JSON.stringify(result));\n';
    inputRead += '        } else {\n';
    inputRead += '            console.log(result);\n';
    inputRead += '        }\n';
    inputRead += '    });\n';
  }
  
  return `/**
 * @param {${params.map(p => p.type).join(' ')}}
 * @return {${returnType}}
 */
const ${functionName} = function(${paramList}) {
    // Your implementation here
    
};

// DO NOT CHANGE THE CODE BELOW
function main() {
${inputRead}}

main();
`;
}

// Helper functions for input reading
function getJavaDefaultValue(type: string): string {
  switch(type) {
    case 'int':
    case 'long':
    case 'double':
      return '0';
    case 'boolean':
      return 'false';
    case 'String':
      return '""';
    case 'int[]':
      return 'new int[0]';
    case 'List<String>':
      return 'new ArrayList<>()';
    default:
      return 'null';
  }
}

function getJavaInputRead(type: string, varName: string): string {
  const scanner = 'scanner';
  switch(type) {
    case 'int':
      return `${scanner}.nextInt()`;
    case 'long':
      return `${scanner}.nextLong()`;
    case 'double':
      return `${scanner}.nextDouble()`;
    case 'boolean':
      return `${scanner}.nextBoolean()`;
    case 'String':
      return `${scanner}.nextLine().trim()`;
    case 'int[]':
      return `Arrays.stream(${scanner}.nextLine().trim().split("\\s*,\\s*"))
            .mapToInt(Integer::parseInt)
            .toArray()`;
    case 'String[]':
      return `${scanner}.nextLine().trim().split("\\s*,\\s*")`;
    default:
      return `${scanner}.nextLine().trim()`;
  }
}

function getPythonInputRead(type: string, varName: string): string {
  switch(type) {
    case 'int':
      return 'int(input().strip())';
    case 'float':
      return 'float(input().strip())';
    case 'bool':
      return 'input().strip().lower() == "true"';
    case 'List[int]':
      return 'list(map(int, input().strip()[1:-1].split(",")))';
    case 'List[str]':
      return 'input().strip()[1:-1].split(",")';
    case 'str':
      return 'input().strip()';
    default:
      return 'input().strip()';
  }
}

function getJavascriptInputRead(type: string, varName: string): string {
  // For simplicity, we'll use a basic approach
  // In a real implementation, you might want to use readline or other methods
  return `(function() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise(resolve => {
        rl.question('', (input) => {
            rl.close();
            resolve(input.trim());
        });
    });
})()`;
}
