;; sBTC Vault Core Contract
;; Version: 0.1.0 (MVP)
;; Description: Basic vault for depositing sBTC and earning yield via Zest

;; ======================
;; CONSTANTS & ERRORS
;; ======================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))
(define-constant ERR-VAULT-PAUSED (err u103))
(define-constant ERR-WITHDRAWAL-LOCKED (err u104))

;; Minimum deposit: 0.001 sBTC (100,000 satoshis)
(define-constant MIN-DEPOSIT u100000)

;; Withdrawal lock period (blocks) - ~24 hours at 10min blocks = 144 blocks
(define-constant WITHDRAWAL-LOCK-PERIOD u144)

;; ======================
;; DATA MAPS & VARS
;; ======================

;; Track each user's vault
(define-map vaults
  { user: principal }
  {
    sbtc-balance: uint,           ;; User's sBTC balance in satoshis
    total-deposits: uint,          ;; Lifetime deposits
    total-withdrawals: uint,       ;; Lifetime withdrawals
    last-deposit-block: uint,      ;; Block height of last deposit
    earned-rewards: uint,          ;; Accumulated rewards
    risk-profile: (string-ascii 20) ;; "conservative" or "aggressive"
  }
)

;; Track protocol-level stats
(define-data-var total-tvl uint u0)
(define-data-var total-users uint u0)
(define-data-var vault-paused bool false)
(define-data-var admin principal CONTRACT-OWNER)

;; Zest protocol integration (placeholder address)
(define-data-var zest-pool-address principal 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR)

;; ======================
;; READ-ONLY FUNCTIONS
;; ======================

;; Get vault details for a user
(define-read-only (get-vault (user principal))
  (default-to
    {
      sbtc-balance: u0,
      total-deposits: u0,
      total-withdrawals: u0,
      last-deposit-block: u0,
      earned-rewards: u0,
      risk-profile: "conservative"
    }
    (map-get? vaults { user: user })
  )
)

;; Get total TVL
(define-read-only (get-total-tvl)
  (ok (var-get total-tvl))
)

;; Get user count
(define-read-only (get-user-count)
  (ok (var-get total-users))
)

;; Check if vault is paused
(define-read-only (is-paused)
  (ok (var-get vault-paused))
)

;; Calculate estimated APY for user (simplified - in production use oracle data)
(define-read-only (get-estimated-apy (user principal))
  (let ((vault-data (get-vault user)))
    (if (> (get sbtc-balance vault-data) u0)
      ;; Simple 8% base APY for conservative, 12% for aggressive
      (ok (if (is-eq (get risk-profile vault-data) "aggressive") u1200 u800))
      (ok u0)
    )
  )
)

;; ======================
;; PUBLIC FUNCTIONS
;; ======================

;; Deposit sBTC into vault
(define-public (deposit (amount uint) (risk-profile (string-ascii 20)))
  (let
    (
      (sender tx-sender)
      (current-vault (get-vault sender))
      (is-new-user (is-eq (get sbtc-balance current-vault) u0))
    )
    
    ;; Validations
    (asserts! (not (var-get vault-paused)) ERR-VAULT-PAUSED)
    (asserts! (>= amount MIN-DEPOSIT) ERR-INVALID-AMOUNT)
    (asserts! (or (is-eq risk-profile "conservative") 
                  (is-eq risk-profile "aggressive")) ERR-INVALID-AMOUNT)
    
    ;; Transfer sBTC from user to contract
    ;; NOTE: In production, use actual sBTC token contract
    ;; (try! (contract-call? .sbtc-token transfer amount sender (as-contract tx-sender) none))
    
    ;; Update user vault
    (map-set vaults
      { user: sender }
      {
        sbtc-balance: (+ (get sbtc-balance current-vault) amount),
        total-deposits: (+ (get total-deposits current-vault) amount),
        total-withdrawals: (get total-withdrawals current-vault),
        last-deposit-block: stacks-block-height,
        earned-rewards: (get earned-rewards current-vault),
        risk-profile: risk-profile
      }
    )
    
    ;; Update global stats
    (var-set total-tvl (+ (var-get total-tvl) amount))
    (if is-new-user
      (var-set total-users (+ (var-get total-users) u1))
      true
    )
    
    ;; TODO: Deploy to Zest in next iteration
    ;; (try! (deploy-to-zest amount))
    
    (print {
      event: "deposit",
      user: sender,
      amount: amount,
      new-balance: (+ (get sbtc-balance current-vault) amount)
    })
    
    (ok true)
  )
)

;; Withdraw sBTC from vault
(define-public (withdraw (amount uint))
  (let
    (
      (sender tx-sender)
      (current-vault (get-vault sender))
      (blocks-since-deposit (- stacks-block-height (get last-deposit-block current-vault)))
    )
    
    ;; Validations
    (asserts! (not (var-get vault-paused)) ERR-VAULT-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (>= (get sbtc-balance current-vault) amount) ERR-INSUFFICIENT-BALANCE)
    
    ;; Security: Enforce withdrawal lock for large amounts (>1 BTC)
    (asserts! 
      (or (< amount u100000000) 
          (>= blocks-since-deposit WITHDRAWAL-LOCK-PERIOD))
      ERR-WITHDRAWAL-LOCKED
    )
    
    ;; Update user vault
    (map-set vaults
      { user: sender }
      (merge current-vault {
        sbtc-balance: (- (get sbtc-balance current-vault) amount),
        total-withdrawals: (+ (get total-withdrawals current-vault) amount)
      })
    )
    
    ;; Update global TVL
    (var-set total-tvl (- (var-get total-tvl) amount))
    
    ;; Transfer sBTC back to user
    ;; NOTE: In production, use actual sBTC token contract
    ;; (try! (as-contract (contract-call? .sbtc-token transfer amount tx-sender sender none)))
    
    (print {
      event: "withdraw",
      user: sender,
      amount: amount,
      new-balance: (- (get sbtc-balance current-vault) amount)
    })
    
    (ok true)
  )
)

;; Update risk profile
(define-public (set-risk-profile (new-profile (string-ascii 20)))
  (let ((sender tx-sender))
    (asserts! (or (is-eq new-profile "conservative") 
                  (is-eq new-profile "aggressive")) ERR-INVALID-AMOUNT)
    
    (match (map-get? vaults { user: sender })
      current-vault
        (begin
          (map-set vaults
            { user: sender }
            (merge current-vault { risk-profile: new-profile })
          )
          (ok true)
        )
      ERR-NOT-AUTHORIZED
    )
  )
)

;; ======================
;; ADMIN FUNCTIONS
;; ======================

;; Emergency pause
(define-public (toggle-pause)
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (var-set vault-paused (not (var-get vault-paused)))
    (ok true)
  )
)

;; Update admin
(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (var-set admin new-admin)
    (ok true)
  )
)

;; Update Zest pool address
(define-public (set-zest-pool (new-pool principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR-NOT-AUTHORIZED)
    (var-set zest-pool-address new-pool)
    (ok true)
  )
)

;; ======================
;; PRIVATE FUNCTIONS
;; ======================

;; Deploy funds to Zest (placeholder for Phase 2)
(define-private (deploy-to-zest (amount uint))
  ;; TODO: Implement actual Zest integration
  ;; (contract-call? .zest-pool supply amount)
  (ok true)
)











































