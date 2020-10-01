# filesJSON
Open a json file, read the content into this and write the this's content back to the json file
<pre><code>npm i files-json</code></pre>

```javascript
const { filesJSON, FileJSON } = require("files-json");
```

<h2>Class: <code>FileJSON</code></h2>
<h3><code>fileJSON.write()</code></h3>
<ul>
    <li>Returns <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">&lt;Promise&gt;</a></li>
</ul>
Returns a Promise and resolves when all data from the instance of the <code>fileJSON</code> has been written to the json file at the <code>filepath</code>.
<h3><code>fileJSON.close()</code></h3>
Instances from <code>FileJSON</code> should be closed when done reading and writing to that file. If number of connections from an instance of <code>FileJSON</code> at a specific <code>filepath</code> have reached 0 then that instance will be removed from memory. However, If the instace was not closed it will stay in memory and that will cause the problem that when the json file from that <code>filepath</code> has been changed by another module, externally or manually, those changes have not be synchronised with the Object in memory.
<h3><code>new FileJSON(filepath)</code></h3>
<ul>
    <li><code>filepath</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a></li>
    <li>Returns <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">&lt;Promise&gt;</a></li>
    <ul>
        <li>Resolves <code>fileJSON</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a></li>
    </ul>
</ul>
Returns a Promise that resolves either the content from the json file parsed into an Object or the Object from an already opened instance of a <code>FileJSON</code>.
<h2><code>filesJSON</code></h2>
An <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">object</a> containing all the <code>filepath</code> keys and <code>FileJSON</code> instances.
<h2>Example</h2>

```javascript
const test1 = async () => {
    const monkey1 = await new FileJSON("monkey.json");
    monkey1.says = "hoehoehaha";
    console.log("test1, monkey1:", monkey1); /*-----> "test1, monkey1: FileJSON { says: 'hoehoehaha' }" */
    await monkey1.write();
    // monkey.json did not exist yet and will be created
    const monkey2 = await new FileJSON("monkey.json");
    console.log(monkey1 === monkey2); /*------------> true */
    monkey1.close();
    monkey2.close();
    // class FileJSON has removed all references to FileJSON("monkey.json")
    // However, monkey1 and monkey2 still reference to FileJSON("monkey.json")
};
const test2 = async () => {
    const monkey3 = await new FileJSON("monkey.json");
    console.log("test2, monkey3:", monkey3); /*-----> "test2, monkey3: FileJSON { says: 'hoehoehaha' }" */
    monkey3.close();
};
(async function test() {
    await test1();
    // all references to the FileJSON("monkey.json") are now gone, it is garbage collected
    await test2();
})();
```