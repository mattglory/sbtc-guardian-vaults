import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("sBTC Guardian Vault - Deposit Tests", () => {
  it("allows user to deposit sBTC into vault", () => {
    const depositAmount = 100000; // 0.001 BTC (minimum)
    
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(depositAmount), Cl.stringAscii("conservative")],
      wallet1
    );
    
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects deposits below minimum amount", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(50000), Cl.stringAscii("conservative")],
      wallet1
    );
    
    expect(result).toBeErr(Cl.uint(102));
  });

  it("tracks total TVL correctly", () => {
    simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(1000000), Cl.stringAscii("conservative")],
      wallet1
    );
    
    simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(2000000), Cl.stringAscii("aggressive")],
      wallet2
    );
    
    const tvl = simnet.callReadOnlyFn(
      "sbtc-vault",
      "get-total-tvl",
      [],
      deployer
    );
    
    expect(tvl.result).toBeOk(Cl.uint(3000000));
  });
});

describe("sBTC Guardian Vault - Withdrawal Tests", () => {
  it("allows user to withdraw sBTC from vault", () => {
    simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(500000), Cl.stringAscii("conservative")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "withdraw",
      [Cl.uint(250000)],
      wallet1
    );
    
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects withdrawal exceeding balance", () => {
    simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(100000), Cl.stringAscii("conservative")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "withdraw",
      [Cl.uint(200000)],
      wallet1
    );
    
    expect(result).toBeErr(Cl.uint(101));
  });
});

describe("sBTC Guardian Vault - Admin Functions", () => {
  it("allows admin to pause vault", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "toggle-pause",
      [],
      deployer
    );
    
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects deposits when paused", () => {
    simnet.callPublicFn(
      "sbtc-vault",
      "toggle-pause",
      [],
      deployer
    );
    
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(100000), Cl.stringAscii("conservative")],
      wallet1
    );
    
    expect(result).toBeErr(Cl.uint(103));
  });

  it("rejects non-admin from pausing", () => {
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "toggle-pause",
      [],
      wallet1
    );
    
    expect(result).toBeErr(Cl.uint(100));
  });
});

describe("sBTC Guardian Vault - Risk Profiles", () => {
  it("allows user to change risk profile", () => {
    simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(100000), Cl.stringAscii("conservative")],
      wallet1
    );
    
    const { result } = simnet.callPublicFn(
      "sbtc-vault",
      "set-risk-profile",
      [Cl.stringAscii("aggressive")],
      wallet1
    );
    
    expect(result).toBeOk(Cl.bool(true));
  });

  it("calculates different APY for risk profiles", () => {
    simnet.callPublicFn(
      "sbtc-vault",
      "deposit",
      [Cl.uint(100000), Cl.stringAscii("conservative")],
      wallet1
    );
    
    const apy = simnet.callReadOnlyFn(
      "sbtc-vault",
      "get-estimated-apy",
      [Cl.principal(wallet1)],
      wallet1
    );
    
    expect(apy.result).toBeOk(Cl.uint(800));
  });
});