

// camelCase 驼峰(小) camelCase		
export function camelCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

				
// capitalCase 分词(大) Capital Case
export function capitalCase(str: string): string {
    return str.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}


// constantCase 常量 CONSTANT_CASE
export function constantCase(str: string): string {
    return str.toUpperCase().replace(/\s+/g, '_');
}


// dotCase 对象属性 dot case
export function dotCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '.');
}


// headerCase 中划线(大) Header-Case
export function headerCase(str: string): string {
    return str.split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-');
}


// noCase 分词(小) no case	
export function noCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, ' ');
}


// paramCase 中划线(小) param-case	
export function paramCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '-');
}


// pascalCase 驼峰(大) PascalCase
export function pascalCase(str: string): string {
    return str.replace(/\w\S*/g, (word) => {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
}


// pathCase 文件路径 path/case	
export function pathCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '/');
}


// snakeCase 下划线 snake_case 
export function snakeCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, '_');
}
