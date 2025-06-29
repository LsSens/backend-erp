import AWS from 'aws-sdk';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configure AWS SDK for LocalStack
const awsConfig: any = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
  endpoint: 'http://localhost:4566',
  sslEnabled: false,
  maxRetries: 3,
  httpOptions: {
    timeout: 30000,
    connectTimeout: 5000,
  },
};

AWS.config.update(awsConfig);

const dynamoDB = new AWS.DynamoDB();
const USERS_TABLE = 'users';

async function checkLocalStackConnection() {
  try {
    console.log('🔍 Verificando conexão com LocalStack...');
    const result = await dynamoDB.listTables().promise();
    console.log('✅ Conexão com LocalStack estabelecida!');
    return true;
  } catch (error: any) {
    console.error('❌ Erro ao conectar com LocalStack:', error.message);
    console.log('💡 Certifique-se que o LocalStack está rodando:');
    console.log('   docker run --rm -it -p 4566:4566 localstack/localstack');
    return false;
  }
}

async function createUsersTable() {
  const params = {
    TableName: USERS_TABLE,
    KeySchema: [
      {
        AttributeName: 'PK',
        KeyType: 'HASH', // Partition key
      },
      {
        AttributeName: 'SK',
        KeyType: 'RANGE', // Sort key
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'SK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'GSI1PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'GSI1SK',
        AttributeType: 'S',
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          {
            AttributeName: 'GSI1PK',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'GSI1SK',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    console.log('Criando tabela de usuários...');
    await dynamoDB.createTable(params).promise();
    console.log(`✅ Tabela "${USERS_TABLE}" criada com sucesso!`);
    
    // Aguardar a tabela ficar ativa
    console.log('Aguardando tabela ficar ativa...');
    await dynamoDB.waitFor('tableExists', { TableName: USERS_TABLE }).promise();
    console.log('✅ Tabela está ativa e pronta para uso!');
    
  } catch (error: any) {
    if (error.code === 'ResourceInUseException') {
      console.log(`⚠️  Tabela "${USERS_TABLE}" já existe.`);
    } else {
      console.error('❌ Erro ao criar tabela:', error.message);
      console.error('Detalhes do erro:', error);
      throw error;
    }
  }
}

async function listTables() {
  try {
    const result = await dynamoDB.listTables().promise();
    console.log('📋 Tabelas existentes:', result.TableNames);
  } catch (error: any) {
    console.error('❌ Erro ao listar tabelas:', error.message);
    console.error('Detalhes do erro:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando criação de tabelas no LocalStack...');
  console.log(`📍 Endpoint: ${process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566'}`);
  console.log(`🔧 Usando LocalStack: ${process.env.USE_LOCALSTACK === 'true' ? 'Sim' : 'Não'}`);
  console.log(`📊 Tabela: ${USERS_TABLE}`);
  
  // Verificar conexão primeiro
  const isConnected = await checkLocalStackConnection();
  if (!isConnected) {
    console.log('❌ Não foi possível conectar ao LocalStack. Abortando...');
    process.exit(1);
  }
  
  await listTables();
  await createUsersTable();
  await listTables();
  
  console.log('✅ Processo concluído!');
}

main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 