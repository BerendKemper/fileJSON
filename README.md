# fileJSON
Open a json file, read the content into this and write the this's content back to the json file

<h2>Class FileJSON</h2>
<h3>fileJSON.write()</h3>
<ul>
    <li>Returns <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">&lt;Promise&gt;</a></li>
</ul>
Returns a Promise and resolves when all data from the fileJSON has been written to the json file at the filepath.
<h3>fileJSON.close()</h3>
If number of connections from FileJSON(filepath) to a json file at filepath have reached 0, it will remove reference to this filepath so that it can be garbage collected.
<h2>new FileJSON(filepath)</h2>
<ul>
    <li><code>filepath</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a></li>
    <li>Returns <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">&lt;Promise&gt;</a></li>
</ul>
Returns a Promise with a a newly opened fileJSON or an already opened fileJSON.
<pre><code>const test1 = async () => {
    const monkey1 = await new FileJSON("monkey.json");
    monkey1.says = "hoehoehaha";
    console.log("test1, monkey1:", monkey1);    // "test1, monkey1: FileJSON { says: 'hoehoehaha' }"
    await monkey1.write();
    const monkey2 = await new FileJSON("monkey.json");
    console.log(monkey1 === monkey2);           // true
    monkey1.close();
    monkey2.close();
    // class FileJSON has removed all references to FileJSON("monkey.json")
    // However, monkey1 and monkey2 still reference to FileJSON("monkey.json")
};
const test2 = async () => {
    const monkey3 = await new FileJSON("monkey.json");
    console.log("test2, monkey3:", monkey3);    // "test2, monkey3: FileJSON { says: 'hoehoehaha' }"
    monkey3.close();
};
(async function test() {
    await test1();
    // all references to the FileJSON("monkey.json") are now gone, it is garbage collected
    await test2();
})();</code></pre>