const swaggerAutogen = require('swagger-autogen')();
const fs = require('fs');

const doc = {
  info: {
    title: 'PSICARE',
    description: 'Documentação das rotas do sistema'
  },
  host: 'localhost:8080',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  paths: {}
};

const routePrefixes = {
  aluno: './src/routes/aluno.ts',
  professor: './src/routes/professor.ts',
  gerencia: './src/routes/gerencia.ts',
  consulta: './src/routes/consulta.ts',
  paciente: './src/routes/paciente.ts',
  relatorio: './src/routes/relatorio.ts',
  secretario: './src/routes/secretario.ts',
  user: './src/routes/user.ts'
};

swaggerAutogen('./swagger-output.json', Object.values(routePrefixes), doc).then(() => {
  const swaggerDocument = require('./swagger-output.json');
  const updatedPaths = {};

  const formatRoute = (prefix, route) => {
    return route === '/' ? `/${prefix}` : `/${prefix}${route}`.replace(/\/+/g, '/');
  };

  for (const route in swaggerDocument.paths) {
    let foundPrefix = null;
    let fixedRoute = route;

    // 1. Remove o trecho "catchdeleteError{...}"
    fixedRoute = fixedRoute.replace(/catchdeleteError\{.*?\}/g, '');
    // 2. Substitui qualquer parâmetro por "{id}"
    fixedRoute = fixedRoute.replace(/\{.*?\}/g, '{id}');
    // 3. Remove caracteres inválidos
    fixedRoute = fixedRoute.replace(/[^a-zA-Z0-9/{}/_-]/g, '');
    // 4. Remove chaves "}" duplicadas, ex.: "{id}}" passa a ser "{id}"
    fixedRoute = fixedRoute.replace(/\{id\}\}+/g, '{id}');
    // 5. Se houver múltiplos parâmetros, mantém apenas um "{id}"
    let pathParams = (fixedRoute.match(/\{.*?\}/g) || []);
    if (pathParams.length > 1) {
      fixedRoute = fixedRoute.replace(/\{.*?\}/g, '{id}');
    }

    // Define o prefixo da rota, se aplicável
    for (const prefix of Object.keys(routePrefixes)) {
      if (route.startsWith(`/${prefix}`)) {
        foundPrefix = prefix;
        break;
      }
    }

    if (!foundPrefix) {
      for (const prefix of Object.keys(routePrefixes)) {
        const newRoute = formatRoute(prefix, fixedRoute);
        updatedPaths[newRoute] = {};

        for (const method in swaggerDocument.paths[route]) {
          updatedPaths[newRoute][method] = {
            ...swaggerDocument.paths[route][method],
            tags: [prefix.charAt(0).toUpperCase() + prefix.slice(1)]
          };
        }
      }
    } else {
      updatedPaths[fixedRoute] = {};

      for (const method in swaggerDocument.paths[route]) {
        updatedPaths[fixedRoute][method] = {
          ...swaggerDocument.paths[route][method],
          tags: [foundPrefix.charAt(0).toUpperCase() + foundPrefix.slice(1)]
        };
      }
    }
  }

  // Ajustar os parâmetros das rotas
  for (const route in updatedPaths) {
    const pathParams = route.match(/\{(.*?)\}/g) || [];
    for (const method in updatedPaths[route]) {
      if (updatedPaths[route][method].parameters) {
        updatedPaths[route][method].parameters.forEach(param => {
          // Se o nome do parâmetro não bater com o que está na rota, corrige
          if (param.in === "path" && !pathParams.includes(`{${param.name}}`)) {
            console.log(`⚠️ Corrigindo parâmetro '${param.name}' para '${pathParams[0] || "{id}"}' na rota ${route}`);
            param.name = pathParams[0] ? pathParams[0].replace(/[{}]/g, '') : "id";
          }
          // Se existir "example", remove-o (pois não é permitido)
          if (param.example) {
            delete param.example;
          }
          // Se não houver "default", adiciona um valor padrão
          if (!param.default) {
            param.default = "123";
          }
        });
      }
    }
  }

  // Para cada rota que contenha {id}, garantir que o parâmetro esteja definido
  for (const route in updatedPaths) {
    if (route.includes('{id}')) {
      for (const method in updatedPaths[route]) {
        if (!updatedPaths[route][method].parameters) {
          updatedPaths[route][method].parameters = [];
        }
        const found = updatedPaths[route][method].parameters.some(p => p.name === 'id' && p.in === 'path');
        if (!found) {
          updatedPaths[route][method].parameters.push({
            name: "id",
            in: "path",
            description: "ID parameter",
            required: true,
            type: "string",
            default: "123"
          });
        }
      }
    }
  }

  // Remover possíveis trechos restantes de "catchdeleteError" das chaves dos caminhos
  const fixedPaths = {};
  for (const key in updatedPaths) {
    const newKey = key.replace(/catchdeleteError\{.*?\}/g, '');
    fixedPaths[newKey] = updatedPaths[key];
  }
  swaggerDocument.paths = fixedPaths;

  // Ajustar as respostas: remover "example" e, se faltar "schema", adiciona um objeto vazio
  for (const route in swaggerDocument.paths) {
    for (const method in swaggerDocument.paths[route]) {
      const responses = swaggerDocument.paths[route][method].responses;
      if (responses) {
        for (const status in responses) {
          const responseObj = responses[status];
          if (responseObj.example) {
            delete responseObj.example;
          }
          if (!responseObj.schema) {
            responseObj.schema = {};
          }
        }
      }
    }
  }

  fs.writeFileSync('./swagger-output.json', JSON.stringify(swaggerDocument, null, 2));
  console.log('✅ Swagger atualizado com parâmetros de caminho corrigidos.');
});
