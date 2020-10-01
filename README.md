# filesJSON
Open a json file, read the content into this and write the this's content back to the json file
<pre><code>npm i files-json</code></pre>

```javascript
const { filesJSON, FileJSON } = require("files-json");
```
<h2>Class: <code>FileJSON</code></h2>
<h3><code>fileJSON.write(callback)</code></h3>
<ul>
	<details>
		<summary>
			<code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
		</summary>
		<ul>
		<details>
			<summary>
				<code>err</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type">&lt;Null&gt;</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error">&lt;Error&gt;</a>
			</summary>
			Is an error in case <a href="https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_writefile_file_data_options_callback">fs.writeFile()</a> had failed.
		</details>
	</ul>
	The <code>callback</code> will be executed after the content from <code>fileJSON</code> has been passed through <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">JSON.stringify()</a> and the string has been written into the json file at the <code>filepath</code>. In case the json file does not exist the file will be created. Prototype method and prototype properties will never be pasred by <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">JSON.stringify()</a> and therefore are never written into the json file. This allows developers to create a self implemented class that can extend from the <code>FilesJSON</code> class and make new methods dedicated to a particular configuration file.
	</details>
</ul>
<h3><code>fileJSON.close()</code></h3>
Instances from <code>FileJSON</code> should be closed when done reading and writing to that file. If number of connections from an instance of <code>FileJSON</code> at a specific <code>filepath</code> have reached 0 then that instance will be removed from memory. However, If the instace was not closed it will stay in memory and that will cause the problem that when the json file from that <code>filepath</code> has been changed by another module, externally or manually, those changes have not been reflected with the Object in memory.
<h3><code>new FileJSON(filepath, callback)</code></h3>
<ul>
	<details>
		<summary>
			<code>filepath</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
		</summary>
	</details>
	<details>
		<summary>
			<code>callback</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function">&lt;Function&gt;</a>
		</summary>
		<ul>
			<details>
				<summary>
					<code>fileJSON</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
				</summary>
			</details>
			In case the json file at the <code>filepath</code> exists the content will be passed through <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse">JSON.parse()</a> the parsed object will be extended by the <code>FileJSON</code> class and then it becomes the <code>fileJSON</code> passed over by the <code>callback</code>. In case the json file at the <code>filepath</code> was already opened, that <code>fileJSON</code> be be passed over  by the <code>callback</code>. In case the json file did not exist a empty <code>fileJSON</code> will be passed over by the <code>callback</code>.
		</ul>
	</details>
</ul>
<h2><code>filesJSON</code></h2>
An <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">object</a> containing all the <code>filepath</code> keys with instances created from <code>new FileJSON()</code>. The <code>filepath</code> and <code>fileJSON</code> will be removed when all connections have been closed.
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