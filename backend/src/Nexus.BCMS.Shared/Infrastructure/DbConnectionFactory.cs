using System.Data;
using Npgsql;

namespace Nexus.BCMS.Shared.Infrastructure
{
    public interface IDbConnectionFactory
    {
        Task<IDbConnection> CreateConnectionAsync();
    }

    public class PostgresConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public PostgresConnectionFactory(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<IDbConnection> CreateConnectionAsync()
        {
            var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();
            return connection;
        }
    }
}
