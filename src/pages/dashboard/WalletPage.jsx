// src/pages/WalletPage.jsx
import { useEffect, useState } from 'react'
import Icon from '../../assets/icons/Icons.jsx'
import { Card, Button, Modal, Input, SuccessState } from '../../components/ui/UI.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { getWalletSummaryApi, getWalletTransactionsApi, withdrawApi } from '../../api/wallet.js'

const QUICK = [500,1000,2000,5000,10000]

export default function WalletPage() {
  const { user, addWalletFunds, setUser } = useApp()
  const [addModal,  setAddModal]  = useState(false)
  const [wdModal,   setWdModal]   = useState(false)
  const [amount,    setAmount]    = useState('')
  const [added,     setAdded]     = useState(false)
  const [withdrawn, setWithdrawn] = useState(false)
  const [wAmount,   setWAmount]   = useState('')
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading] = useState(false)

  const refreshTransactions = async () => {
    try {
      setTxLoading(true)
      const res = await getWalletTransactionsApi({ limit: 20, offset: 0 })
      setTransactions(res?.data?.data || [])
    } catch {
      setTransactions([])
    } finally {
      setTxLoading(false)
    }
  }

  useEffect(() => {
    refreshTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = async () => {
    if (!amount) return
    await addWalletFunds(amount)
    await refreshTransactions()
    setAdded(true)
    setTimeout(()=>{ setAddModal(false); setAdded(false); setAmount('') }, 1800)
  }
  const handleWd = async () => {
    if (!wAmount) return
    try {
      await withdrawApi(Number(wAmount))
      const sumRes = await getWalletSummaryApi()
      const d = sumRes?.data?.data
      if (d) setUser((p) => (p ? { ...p, wallet: d.wallet, escrow: d.escrow, totalEarned: d.totalEarned } : p))
      await refreshTransactions()
      setWithdrawn(true)
      setTimeout(()=>{ setWdModal(false); setWithdrawn(false); setWAmount('') }, 1800)
    } catch {
      // Keep modal open on failure.
    }
  }

  const ico = t => {
    if (t==='credit') return { bg:'#D1FAE5', color:'var(--c-success)', icon:'arrowLeft' }
    if (t==='escrow') return { bg:'var(--c-accent-lt)', color:'var(--c-accent)', icon:'shield' }
    return { bg:'#FEE2E2', color:'var(--c-danger)', icon:'arrowRight' }
  }

  return (
    <div className="page-wrap">
      <div className="container-sm" style={{paddingTop:36,paddingBottom:36}}>
        <div style={{marginBottom:28}}>
          <h1 className="serif" style={{fontSize:'clamp(26px,4vw,36px)',fontWeight:700,color:'var(--c-dark)'}}>My Wallet</h1>
          <p style={{color:'var(--c-mid)',marginTop:6}}>Manage your balance, escrow, and withdrawals.</p>
        </div>

        {/* Balance Cards */}
        <div className="wallet-cards">
          <div className="wallet-card" style={{background:'linear-gradient(135deg,var(--c-primary) 0%,var(--c-primary-dk) 100%)'}}>
            <p className="wcard-label" style={{color:'rgba(255,255,255,.7)'}}>AVAILABLE BALANCE</p>
            <p className="wcard-amount" style={{color:'#fff'}}>₹{(user?.wallet??0).toLocaleString()}</p>
            <p className="wcard-sub" style={{color:'rgba(255,255,255,.6)'}}>Ready to use or withdraw</p>
          </div>
          <Card flat style={{padding:24}}>
            <p className="wcard-label" style={{color:'var(--c-muted)'}}>ESCROW LOCKED</p>
            <p className="wcard-amount" style={{color:'var(--c-accent)'}}>₹{(user?.escrow??900).toLocaleString()}</p>
            <p className="wcard-sub" style={{color:'var(--c-muted)'}}>1 booking in progress</p>
          </Card>
          <Card flat style={{padding:24}}>
            <p className="wcard-label" style={{color:'var(--c-muted)'}}>TOTAL EARNED</p>
            <p className="wcard-amount" style={{color:'var(--c-success)'}}>₹{(user?.totalEarned??18290).toLocaleString()}</p>
            <p className="wcard-sub" style={{color:'var(--c-muted)'}}>Lifetime earnings</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="wallet-actions">
          <Button onClick={()=>setAddModal(true)} icon="plus" size="lg">Add Balance</Button>
          <Button onClick={()=>setWdModal(true)} variant="secondary" icon="download" size="lg">Withdraw to Bank</Button>
        </div>

        {/* Transactions */}
        <Card flat style={{padding:28}}>
          <h3 style={{fontWeight:700,fontSize:19,color:'var(--c-dark)',marginBottom:20}}>Transaction History</h3>
          {txLoading ? (
            <p style={{ color:'var(--c-mid)' }}>Loading…</p>
          ) : transactions.length === 0 ? (
            <p style={{ color:'var(--c-mid)' }}>No transactions yet.</p>
          ) : (
            transactions.map(t=>{
              const i = ico(t.type)
              return (
                <div key={t.id} className="txn-row">
                  <div style={{display:'flex',alignItems:'center'}}>
                    <div className="txn-icon" style={{background:i.bg}}><Icon name={i.icon} size={16} color={i.color}/></div>
                    <div><p className="txn-desc">{t.desc}</p><p className="txn-date">{t.date}</p></div>
                  </div>
                  <span className={`txn-amount ${t.amount>0?'txn-credit':'txn-debit'}`}>
                    {t.amount>0?'+':''}₹{Math.abs(t.amount).toLocaleString()}
                  </span>
                </div>
              )
            })
          )}
        </Card>
      </div>

      {/* Add Money Modal */}
      <Modal open={addModal} onClose={()=>setAddModal(false)} title="Add Money to Wallet" width={440}>
        {!added ? (
          <>
            <p style={{fontSize:13,color:'var(--c-muted)',marginBottom:14}}>Select quick amount or enter custom:</p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
              {QUICK.map(a=>(
                <button key={a} onClick={()=>setAmount(String(a))} style={{
                  padding:'10px 18px',borderRadius:10,fontWeight:600,cursor:'pointer',fontSize:14,fontFamily:'var(--font-sans)',
                  border:`1.5px solid ${amount==a?'var(--c-primary)':'var(--c-border)'}`,
                  background:amount==a?'var(--c-primary-lt)':'transparent',
                  color:amount==a?'var(--c-primary)':'var(--c-mid)',
                }}>₹{a.toLocaleString()}</button>
              ))}
            </div>
            <Input label="Or enter custom amount (₹)" type="number" placeholder="Any amount" value={amount} onChange={e=>setAmount(e.target.value)} icon="rupee" />
            <div style={{marginBottom:20}}>
              <p className="form-label" style={{marginBottom:10}}>Payment Method</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                {['UPI','Card','Net Banking','Wallet'].map(m=>(
                  <div key={m} style={{padding:'10px 6px',border:`1.5px solid var(--c-border)`,borderRadius:8,textAlign:'center',cursor:'pointer',fontSize:11,fontWeight:600,color:'var(--c-mid)'}}>{m}</div>
                ))}
              </div>
            </div>
            <Button onClick={handleAdd} fullWidth size="lg">Add ₹{amount?Number(amount).toLocaleString():'0'}</Button>
          </>
        ) : (
          <SuccessState title="Money Added!" message={`₹${Number(amount).toLocaleString()} added to your wallet.`} onClose={()=>setAddModal(false)} />
        )}
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={wdModal} onClose={()=>setWdModal(false)} title="Withdraw to Bank" width={440}>
        {!withdrawn ? (
          <>
            <div style={{background:'var(--c-bg)',borderRadius:12,padding:16,marginBottom:20}}>
              <p style={{fontSize:13,color:'var(--c-muted)'}}>Available for withdrawal</p>
              <p className="serif" style={{fontSize:30,fontWeight:700,color:'var(--c-primary)'}}>₹{(user?.wallet??0).toLocaleString()}</p>
            </div>
            <Input label="Bank Account Number" placeholder="Enter account number" icon="bank" onChange={()=>{}} />
            <Input label="IFSC Code" placeholder="e.g. HDFC0001234" onChange={()=>{}} />
            <Input label="Amount to Withdraw (₹)" type="number" placeholder={`Max ₹${(user?.wallet??0).toLocaleString()}`} value={wAmount} onChange={e=>setWAmount(e.target.value)} icon="rupee" />
            <div style={{background:'#FEF3C7',padding:14,borderRadius:10,marginBottom:18,display:'flex',gap:10,alignItems:'flex-start'}}>
              <Icon name="clock" size={16} color="var(--c-warning)"/>
              <p style={{fontSize:12,color:'#92400E',lineHeight:1.5}}>Processing time: 1–3 business days. Minimum withdrawal: ₹200.</p>
            </div>
            <Button onClick={handleWd} fullWidth size="lg" icon="arrowRight">Submit Withdrawal Request</Button>
          </>
        ) : (
          <SuccessState title="Withdrawal Requested!" message="Funds will arrive in 1–3 business days." onClose={()=>setWdModal(false)} />
        )}
      </Modal>
    </div>
  )
}
