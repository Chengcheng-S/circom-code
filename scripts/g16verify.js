const snarkjs = require("snarkjs");
const fs = require("fs");

async function run() {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve({in1: 10, in2: 21,in3:6}, "./3multi_js/3multi.wasm", "./3multi_js/multiplier2_0001.zkey");

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));

    const vKey = JSON.parse(fs.readFileSync("./3multi_js/verification_key.json"));

    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }

}

async function gen_key(){
    console.log("start gen key step 1");
    execSync("snarkjs grtoth16 setup multi_three.r1cs pot14_final.ptau circuit_0000.zkey");
    execSync("snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name='1st Contributor Name' -v",{stdio:"inherit"});

    console.log("setp 2")
    execSync("snarkjs zkey contribute circuit_0001.zkey circuit_0002.zkey --name='Second contribution Name' -v -e='Another random entropy'",{stdio:"inherit"});

    console.log("setp 3 Provide a third contribution using third party software");
    execSync("snarkjs zkey export bellman circuit_0002.zkey  challenge_phase2_0003");
    execSync("snarkjs zkey bellman contribute bn128 challenge_phase2_0003 response_phase2_0003 -e='some random text'");
    execSync("snarkjs zkey import bellman circuit_0002.zkey response_phase2_0003 circuit_0003.zkey -n='Third contribution name'");


    console.log("verify the latest zkey");
    execSync("snarkjs zkey verify circuit.r1cs pot14_final.ptau circuit_0003.zkey");

    console.log("apply random beacon");
    execSync("snarkjs zkey beacon circuit_0003.zkey circuit_final.zkey 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n='Final Beacon phase2'");


    console.log("export veification zkey");
    execSync("snarkjs zkey export verificationkey circuit_final.zkey  ./vk/verification_key.json");

    console.log("gen zkey success");
}


run().then(() => {
    process.exit(0);
});