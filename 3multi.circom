pragma circom 2.1.9;

include "./2mulit.circom";

template Multipiler3(){
    signal input in1;
    signal input in2;
    signal input in3;
    signal res;
    res <== Multiplier2()(in1,in2);
    signal output out <== Multiplier2()(res,in3);
}

component main = Multipiler3();