var neo4j = require('neo4j-driver').v1;
exports.driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "34602488"));