const core = require('@actions/core')
const github = require('@actions/github')
const { exception } = require('console')
const fs = require('fs')
const sys = require('child_process')
const os = require('os')
const http = require('http')

function stanza() {
    const path = core.getInput('path')
    const stanza = path ? path : `${process.cwd()}/stanza/stanza`
    if (!fs.existsSync(stanza)) {
        throw `No stanza compiler exists on path ${stanza}`
    }
    return stanza
}

function install() {
    const version = core.getInput('version')
    console.log(`installing stanza ${version}`)
    const fileVersion = version.replace('.', '_')
    var filename = ''
    var platform = ''
    if (os.platform() == 'darwin') {
        filename = `stanza_${fileVersion}`
        platform = 'os-x'
    } else if (os.platform() == 'linux') {
        filename = `lstanza_${fileVersion}`
        platform = 'linux'
    } else {
        throw 'Unsupported platform'
    }

    const zipFile = fs.createWriteStream(`${filename}.zip`)
    const request = http.get(`http://lbstanza.org/resources/stanza/${filename}.zip`, (response) => {
        response.pipe(zipFile)
    })

    request.on('error', () => {
        core.setFailed(`Could not download ${filename}.zip from lbstanza.org`)
    })

    zipFile.on('finish', () => {
        zipFile.close()
        if (fs.existsSync('stanza/stanza')) {
            fs.rmdirSync('stanza')
        }
        fs.mkdirSync('stanza')
        sys.execSync(`unzip -d stanza ${filename}.zip`)
        process.chdir('stanza')
        sys.execSync(`./stanza install -platform ${platform}`)
        sys.execSync(`ln -s /usr/bin/stanza ${process.cwd()}/stanza`)
        process.chdir('..')
        fs.unlink(`${filename}.zip`)
    })
}

function runCommand(command) {
    sys.exec(`${stanza()} ${command}`, (error, stdout, stderr) => {
        console.log(stdout)
        console.error(stderr)
        if (error) {
            core.setFailed(error.message)
        }
    })
}

try {
    const command = core.getInput('command')
    switch(command) {
        case 'install': 
            install()
            break
        default:
            runCommand(command)
    }
} catch (error) {
    core.setFailed(error.message)
}