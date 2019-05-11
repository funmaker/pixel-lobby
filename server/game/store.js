import _ from "lodash";
import BSON from "bson";
import fs from "fs-extra";

export default class Store {
  filename;
  data = {};
  
  constructor(filename) {
    this.filename = filename;
    this.load();
  }
  
  async load() {
    if(await fs.pathExists(this.filename)) {
      this.data = BSON.deserialize(fs.readFileSync(this.filename));
    }
  }
  
  get(key) {
    return this.data[key];
  }
  
  set(key, value) {
    this.data[key] = value;
    this.save();
  }
  
  save = _.debounce(() => {
    fs.writeFile(this.filename, BSON.serialize(this.data));
  }, 500, { maxWait: 5000 })
}

