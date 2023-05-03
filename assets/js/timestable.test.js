//const timestable = require("./timestable");
import { getRandomInt } from "./timestable.js";

const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5;
global.Math = mockMath;

test("Returns about-us for english language", () => {
    let result = getRandomInt(10);
    expect(typeof result).toBe('number');
    expect(result).toBe(6);
});
