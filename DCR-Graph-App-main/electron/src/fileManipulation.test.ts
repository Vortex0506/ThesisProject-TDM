const { saveFile } = require("../src/fileManipulation");
jest.mock("fs", () => ({
  writeFile: jest.fn( (path, content, callback) => callback() ),
}));

const fs = require("fs");

describe('saveFile', () => {
  test('Doesnt throw on valid invocation', async () => {
    await saveFile("/somepath/somefile", { someProperty: "someValue" });
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });
});