# Github Action for LB Stanza
## Inputs
### `command`

*** Required ***

The command for the stanza compiler to run. If set to `'install'` the compiler will be downloaded and installed to the current directory. 

### `path` 

The path to invoke the stanza compiler. Defaults to `$PWD/stanza`. 

## Usage

```yaml
    - name: "Install Stanza"
      uses: m-hilgendorf/stanza-action@0.1.0
      with:
        command: install
    - name: "Print Stanza Version"
      with:
        command: version
    - name: "Compile Stanza Tests"
      with: 
        command: compile-tests my/package -o tests
    - name: "Run Tests"
      run: ./tests
```