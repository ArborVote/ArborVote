module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "5777" // Match any network id
    }
  }
};
