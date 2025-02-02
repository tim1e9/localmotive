import fs from 'fs/promises';

let config = null;

const loadConfig = async (pathAndFilename) => {
    const data = await fs.readFile(pathAndFilename, 'utf8');
    config = JSON.parse(data);
    return config;
}

const pathsAndMethodsMatch = (endpoint, targetPath, targetMethod) => {
    const s = endpoint.path.split("/");
    const t = targetPath.split("/");
    if (s.length != t.length) {
        return false;
    }
    let rc = true;
    s.forEach( (elem, idx) => {
        rc = rc && (elem.startsWith("{") && elem.endsWith("}")
                ||  elem == t[idx]);
    })
    return rc && (endpoint.method == targetMethod || endpoint.method == "ANY");
};

const getFunctionDetailsFromPathAndMethod = (path, method) => {
    try {
        // Iterate across all endpoints to find a match
        const curEndpoint = config.endpoints.find( (endpoint) =>
            pathsAndMethodsMatch(endpoint, path, method));
        return curEndpoint;
    } catch(exc) {
        // Note: A null config will be caught here too
        console.error(`Exception retrieving function: ${exc.message}`);
        return null;
    }
}

const getFunctionDetailsFromName = (name) => {
    try {
        // Iterate across all endpoints to find a match
        const curEndpoint = config.endpoints.find( (endpoint) => 
            name == endpoint.function.name);
        return curEndpoint;
    } catch(exc) {
        console.error(`Exception retrieving function: ${exc.message}`);
        return null;
    }
}

export { loadConfig, getFunctionDetailsFromPathAndMethod, getFunctionDetailsFromName }