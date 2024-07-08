beforeEach(() => {
  // since our NODE_ENV injection logic is via cli, we need to delete "test" NODE_ENV to avoid affecting the default build config
  delete process.env.NODE_ENV;
});
