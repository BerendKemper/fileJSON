# filesJSON
Open a json file, read the content into this and write the this's content back to the json file
Version that  uses Promises!
<pre><code>npm i files-json</code></pre>

```javascript
const { filesJSON, FileJSON } = require("files-json");
```
<h2>Class: <code>FileJSON</code></h2>
<h3><code>fileJSON.write()</code></h3>
<ul>
	<details>
		<summary>
			Returns <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">&lt;Promise&gt;</a>
		</summary>
		<ul>
		<details>
			<summary>
				<code>resolve</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve">&lt;Promise.resolve&gt;</a>
			</summary>
			<ul>
				<details>
					<summary>
						<code>err</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Null_type">&lt;Null&gt;</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error">&lt;Error&gt;</a>
					</summary>
					Is an error in case <a href="https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_writefile_file_data_options_callback">fs.writeFile()</a> had failed.
				</details>
			</ul>
		</details>
	</ul>
	Returns a <code>Promise</code> that can be awaited and it resolves after the content from <code>fileJSON</code> has been passed through <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">JSON.stringify()</a> and the string has been written into the json file at the <code>filepath</code>. In case the json file does not exist the file will be created. Prototype method and prototype properties will never be pasred by <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">JSON.stringify()</a> and therefore are never written into the json file. This allows developers to create a self implemented class that can extend from the <code>FilesJSON</code> class and make new methods dedicated to a particular configuration file.
	</details>
</ul>
<h3><code>fileJSON.close()</code></h3>
<details>
	<summary>Memory</summary>
	In case the <code>fileJSON</code> is not closed be aware of abundant memory usage because objects are being stored and not used. When the number of connections to a <code>fileJSON</code> at a particular <code>filepath</code> have reached 0 then the <code>fileJSON</code> will be removed from the internal <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Keyed_collections_Maps_Sets_WeakMaps_WeakSets">Map</a>.
</details>
<details>
	<summary>data-synchronization</summary>
	If a json file at that particular <code>filepath</code> is actively opened in a <code>fileJSON</code> object and if the content of that json file at that particular <code>filepath</code> had been modified outside of the <code>fileJSON</code> object these modifications do not reflect back to the <code>fileJSON</code> object. Therefore when a <code>fileJSON</code> had not been closed when it was not used anymore data may be out of sync. However if the particular json file is never modified outside of the <code>fileJSON</code> object, there is nothing to worry about.
</details>
<h3><code>new FileJSON(filepath)</code></h3>
<ul>
	<details>
		<summary>
			<code>filepath</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type">&lt;string&gt;</a>
		</summary>
		The <code>filepath</code> will be added to the <code>filesJSON</code> object. 
	</details>
	<details>
		<summary>
			Returns <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">&lt;Promise&gt;</a>
		</summary>
		<ul>
			<details>
				<summary>
					<code>resolve</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve">&lt;Promise.resolve&gt;</a>
				</summary>
				<ul>
					<details>
						<summary>
							<code>fileJSON</code> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">&lt;object&gt;</a>
						</summary>
						On reading either the content of a json file will be passed through <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse">JSON.parse()</a> or a new empty <code>fileJSON</code> object is created and passed by the <code>callback</code>. In case the json file at the <code>filepath</code> was already opened, that <code>fileJSON</code> will be be passed over by the <code>callback</code>. In case the internal <code>new FileJSON()</code> was still reading and at the same time the same <code>filepath</code> is opened somewhere else by another <code>new FileJSON()</code> the latter will be put into a readQueue and return the same object as the first. 
					</details>
				</ul>
			</details>
		</ul>
		The callback will be executed when the internal <code>fileJSON</code> has finished creating the <code>fileJSON</code>.
	</details>
</ul>
<h2><code>filesJSON</code></h2>
<details>
	<summary>keys</summary>
	The <code>filepath</code>
</details>
<details>
	<summary>values</summary>
	The <code>fileJSON</code> created from <code>new FileJSON()</code>.
</details>
<h2>Example</h2>

```javascript
const test1 = async () => {
	const monkey1 = await new FileJSON("monkey.json");
	monkey1.says = "hoehoehaha";
	console.log("test1, monkey1:", monkey1);
	// "test1, monkey1: FileJSON { says: 'hoehoehaha' }" 
	await monkey1.write();
	// monkey.json did not exist yet and will be created
	const monkey2 = await new FileJSON("monkey.json");
	console.log("monkey1 === monkey2:", monkey1 === monkey2);
	monkey1.close();
	console.log(filesJSON);
	monkey2.close();
	console.log(filesJSON, "<-- empty, BUT WAIT monkey2-->", monkey2);
	// class FileJSON has removed all references to FileJSON("monkey.json")
	// However, monkey1 and monkey2 within this scope 
	// still reference to FileJSON("monkey.json")
};
const test2 = () => {
	new FileJSON("monkey.json").then(monkey3 => { // reads data from file
		console.log("test2, monkey3:", monkey3);
		// "test2, monkey3: FileJSON { says: 'hoehoehaha' }"
		monkey3.close();
	});
};
(async function test() {
	await test1();
	// all references to the FileJSON("monkey.json") are now gone, it is garbage collected
	test2();
})();
```