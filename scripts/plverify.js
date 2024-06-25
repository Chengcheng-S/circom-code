const snarkjs = require("snarkjs");
const fs = require("fs");
const { execSync, exec } = require("child_process");



async function setup(){
    console.log("start plonk setup");
    execSync("snarkjs plonk setup multi_three.r1cs pot14_final.ptau circuit_final.zkey")
    const issetup = await snarkjs.plonk.setup("multi_three.r1cs", "pot14_final.ptau", "circuit_final.zkey");
    if (issetup){
        console.log("plonk setup success");
    }

    console.log("export vk to json");
    execSync("snarkjs zkey export verificationkey circuit_final.zkey ./vk/verification_key.json");
}

async function plonk_prove(){
    const{proof, pI}=  await snarkjs.plonk.prove(
        "circuit_final.zkey",
        "./witness/witness.wtns",
    );
    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));

    console.log("plonk prove success");

    const vkey = JSON.parse(fs.readFileSync("./vk/verification_key.json"));

    const res = await snarkjs.plonk.verify(vkey, pI, proof);
    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }

}

// power of tau
async function power_of_tau(){
    console.log("setup plonk")

    // compile circuit
    execSync("circom ./circuits/multi_three.circom --r1cs --wasm --sym");
    
    // plonk steup
    console.log("trusting setup setp 1 ");
    execSync("snarkjs powersoftau new bn254 14 pot14_0000.ptau -v");

    console.log("trusting setup setp 2 generate ptau");
    execSync("snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name='First contribution' -v",{stdio:"inherit"});

    execSync("snarkjs powersoftau contribute pot14_0001.ptau pot14_0002.ptau --name='Second contribution' -v -e='some random text'",{stdio:"inherit"});
    
    console.log("trusting setup setp 3");
    execSync("snarkjs powersoftau export challenge pot14_0002.ptau challenge_0003");
    execSync("snarkjs powersoftau challenge contribute bn128 challenge_0003 response_0003 -e='some random text'");
    execSync("snarkjs powersoftau import response pot14_0002.ptau response_0003 pot14_0003.ptau -n='Third contribution name'");


    console.log("verify the protocol");
    execSync("snarkjs powersoftau verify pot14_0003.ptau");


    console.log("apply a random beacon");
    execSync("snarkjs powersoftau beacon pot14_0003.ptau pot14_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n='Final Beacon'");

    console.log("Prepare phase 2 maybe long time decide your CPU");
    execSync("snarkjs powersoftau prepare phase2 pot14_beacon.ptau pot14_final.ptau -v");

    console.log("verify final ptau");
    execSync("snarkjs powersoftau verify pot14_final.ptau");

    console.log("generate ptau sueecess");

}


// witness
const input_values={
    "in1":"10",
    "in2":"6",
    "in3":"9",
}

async function generate_witness(){
    console.log("generate rlcs.json");
    execSync("snarkjs r1cs export json multi_three.r1cs circuit.r1cs.json");

    const inputs = JSON.stringify(input_values);
    fs.writeFileSync("input.json",inputs);

    console.log("generate witness");
    execSync("node ./multi_three_js/generate_witness.js ./multi_three_js/multi_three.wasm input.json ./witness/witness.wtns");

    console.log("check witness");
    execSync("snarkjs wtns check multi_three.r1cs ./witness/witness.wtns");
    console.log("generate witness success");
}


async function verify(){
    const {proof, publicSignals} = await snarkjs.plonk.fullProve({in1: 10, in2: 21,in3:6}, "./multi_three_js/multi_three.wasm", "./circuit_final.zkey");
    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));

    const vkey = JSON.parse(fs.readFileSync("./vk/verification_key.json"));

    const res = await snarkjs.plonk.verify(vkey, publicSignals, proof);
    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }
}

verify().then(() => {
    process.exit(0);
})
