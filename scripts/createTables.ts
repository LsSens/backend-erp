import AWS from 'aws-sdk';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configure AWS SDK for LocalStack
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'test',
  secretAccessKey: 'test',
});

const dynamoDB = new AWS.DynamoDB({
  endpoint: 'http://localhost:4566',
  sslEnabled: false,
});

const checkLocalStackConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Verificando conexão com LocalStack...');
    const _result = await dynamoDB.listTables().promise();
    console.log('✅ Conexão com LocalStack estabelecida!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com LocalStack:', error);
    return false;
  }
};

const createTables = async () => {
  const isConnected = await checkLocalStackConnection();
  if (!isConnected) {
    console.error(
      '❌ Não foi possível conectar com LocalStack. Certifique-se de que está rodando.'
    );
    process.exit(1);
  }

  const tables = [
    {
      TableName: 'erp-users',
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'GSI1PK', AttributeType: 'S' },
        { AttributeName: 'GSI1SK', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1',
          KeySchema: [
            { AttributeName: 'GSI1PK', KeyType: 'HASH' },
            { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
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
    },
  ];

  for (const table of tables) {
    try {
      console.log(`🔧 Criando tabela: ${table.TableName}`);
      await dynamoDB.createTable(table).promise();
      console.log(`✅ Tabela ${table.TableName} criada com sucesso!`);
    } catch (error: any) {
      if (error.code === 'ResourceInUseException') {
        console.log(`ℹ️  Tabela ${table.TableName} já existe.`);
      } else {
        console.error(`❌ Erro ao criar tabela ${table.TableName}:`, error);
      }
    }
  }

  console.log('🎉 Processo de criação de tabelas concluído!');
};

createTables().catch(console.error);
