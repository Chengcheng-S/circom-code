pragma circom 2.1.9;

template Multiplier2() {
    signal input a;
    signal input b;
    signal output c;
    c <== a * b;
}
