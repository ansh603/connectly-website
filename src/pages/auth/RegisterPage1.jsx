// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../../assets/icons/Icons.jsx'
import { Card, Button, Input, Textarea, Badge, SuccessState } from '../../components/ui/UI.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { INTERESTS } from '../../data/mockData.js'

const STEPS = [{n:1,label:'Basic Info'},{n:2,label:'Your Profile'},{n:3,label:'Verification'}]

export default function RegisterPage() {
  const { login } = useApp()
  const nav = useNavigate()
  const [step,     setStep]     = useState(1)
  const [verified, setVerified] = useState(false)
  const [complete, setComplete] = useState(false)
  const [basic,    setBasic]    = useState({name:'',mobile:'',email:'',password:'',type:'individual'})
  const [profile,  setProfile]  = useState({bio:'',rate:'',location:'',interests:[],age:''})
  const [galleryPhotos, setGalleryPhotos] = useState([])  // max 5 gallery images

  const bUpd = f => e => setBasic({...basic,[f]:e.target.value})
  const pUpd = f => e => setProfile({...profile,[f]:e.target.value})
  const toggleInt = i => setProfile(p=>({...p,interests:p.interests.includes(i)?p.interests.filter(x=>x!==i):[...p.interests,i]}))

  const handleComplete = () => {
    setComplete(true)
    setTimeout(()=>{ login({name:basic.name||'New User',interests:profile.interests, galleryPhotos}); nav('/') },1600)
  }

  return (
    <div className="register-page">
      <div className="register-box">
        <div className="register-logo">
          <div className="register-logo-icon"><Icon name="users" size={28} color="#fff"/></div>
          <h1 className="serif" style={{fontSize:28,fontWeight:700,color:'var(--c-dark)'}}>Join Connectly</h1>
          <p style={{color:'var(--c-mid)',fontSize:14,marginTop:5}}>Create your verified social profile</p>
        </div>

        {/* Steps */}
        <div className="progress-steps">
          {STEPS.map(s=>{
            const done   = s.n < step
            const active = s.n === step
            return (
              <div key={s.n} className="pstep">
                <div className={`pstep-circle${done?' done':active?' active':''}`}>
                  {done ? <Icon name="check" size={14} color="#fff"/> : s.n}
                </div>
                <div className={`pstep-label${active?' active':''}`}>{s.label}</div>
              </div>
            )
          })}
        </div>

        <Card flat style={{padding:32}}>

          {/* Step 1 */}
          {step===1 && (
            <>
              <h3 style={{fontWeight:700,fontSize:18,marginBottom:20,color:'var(--c-dark)'}}>Basic Information</h3>
              <Input label="Full Name"       placeholder="Your full name"         value={basic.name}     onChange={bUpd('name')}     icon="user"    required />
              <Input label="Mobile Number"   placeholder="+91 XXXXX XXXXX"        value={basic.mobile}   onChange={bUpd('mobile')}               required />
              <Input label="Email Address"   type="email" placeholder="your@email.com" value={basic.email} onChange={bUpd('email')}              required />
              <Input label="Password"        type="password" placeholder="Create a strong password" value={basic.password} onChange={bUpd('password')} required />
              <div style={{marginBottom:24}}>
                <p className="form-label">Register As</p>
                <div className="type-grid">
                  {[{v:'individual',icon:'user',l:'Individual'},{v:'group',icon:'users',l:'Group'}].map(t=>(
                    <button key={t.v} className={`type-btn${basic.type===t.v?' active':''}`} onClick={()=>setBasic({...basic,type:t.v})}>
                      <Icon name={t.icon} size={26} color={basic.type===t.v?'var(--c-primary)':'var(--c-muted)'}/>
                      <span>{t.l}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={()=>setStep(2)} fullWidth size="lg" iconRight="arrowRight">Continue</Button>
              <p className="auth-switch">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">Sign In</Link>
              </p>
            </>
          )}

          {/* Step 2 */}
          {step===2 && (
            <>
              <h3 style={{fontWeight:700,fontSize:18,marginBottom:20,color:'var(--c-dark)'}}>Complete Your Profile</h3>

              {/* GROUP-ONLY FIELDS — shown only when type === 'group' */}
              {basic.type === 'group' && (
                <div style={{
                  background:'var(--c-primary-lt)', borderRadius:14,
                  padding:'16px', marginBottom:20,
                  border:'1.5px solid rgba(13,148,136,0.2)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <Icon name="users" size={15} color="var(--c-primary)" />
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--c-primary)' }}>Group Details</p>
                  </div>
                  <Input
                    label="Group Name"
                    placeholder="e.g. Sunday Strikers, FunSquad Mumbai"
                    value={profile.groupName || ''}
                    onChange={e => setProfile(p=>({...p, groupName: e.target.value}))}
                    icon="users"
                    required
                  />
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <Input
                      label="Number of Members"
                      type="number"
                      placeholder="e.g. 5"
                      value={profile.members || ''}
                      onChange={e => setProfile(p=>({...p, members: e.target.value}))}
                      icon="users"
                      required
                    />
                    <div className="form-group">
                      <label className="form-label">Group Type</label>
                      <select
                        value={profile.groupType || ''}
                        onChange={e => setProfile(p=>({...p, groupType: e.target.value}))}
                        style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid var(--c-border)', fontFamily:'var(--font-sans)', fontSize:14, outline:'none', background:'#fff', color:'var(--c-dark)' }}
                      >
                        <option value="">Select type</option>
                        <option value="friends">Friends Group</option>
                        <option value="sports">Sports Team</option>
                        <option value="corporate">Corporate Group</option>
                        <option value="entertainment">Entertainment Group</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  {/* Group Image Upload */}
                  <div className="form-group">
                    <label className="form-label">Group Photo</label>
                    <div
                      onClick={() => document.getElementById('group-img-input').click()}
                      style={{
                        border:'2px dashed var(--c-primary)', borderRadius:12,
                        padding:'20px', textAlign:'center', cursor:'pointer',
                        background:'rgba(13,148,136,0.04)',
                        transition:'all .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(13,148,136,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background='rgba(13,148,136,0.04)'}
                    >
                      {profile.groupImagePreview ? (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                          <img src={profile.groupImagePreview} alt="Group" style={{ width:64, height:64, borderRadius:12, objectFit:'cover' }} />
                          <p style={{ fontSize:12, color:'var(--c-primary)', fontWeight:600 }}>Change Photo</p>
                        </div>
                      ) : (
                        <>
                          <Icon name="camera" size={28} color="var(--c-primary)" />
                          <p style={{ fontSize:13, fontWeight:600, color:'var(--c-primary)', marginTop:8 }}>Upload Group Photo</p>
                          <p style={{ fontSize:11, color:'var(--c-muted)', marginTop:4 }}>JPG, PNG up to 5MB</p>
                        </>
                      )}
                    </div>
                    <input
                      id="group-img-input"
                      type="file"
                      accept="image/*"
                      style={{ display:'none' }}
                      onChange={e => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = ev => setProfile(p=>({...p, groupImage: file, groupImagePreview: ev.target.result}))
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Point 1: Individual → Age field only */}
              {basic.type === 'individual' && (
                <Input
                  label="Age"
                  type="number"
                  placeholder="Your age"
                  value={profile.age || ''}
                  onChange={e => setProfile(p=>({...p, age: e.target.value}))}
                  icon="user"
                  required
                />
              )}

              {/* Point 1: Group → Contact Name, Age, Mobile */}
              {basic.type === 'group' && (
                <div style={{
                  background:'rgba(249,250,251,0.8)', borderRadius:14,
                  padding:'16px', marginBottom:8,
                  border:'1.5px solid rgba(13,148,136,0.15)',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <Icon name="user" size={15} color="var(--c-primary)" />
                    <p style={{ fontSize:13, fontWeight:700, color:'var(--c-primary)' }}>Representative Details</p>
                  </div>
                  <Input
                    label="Contact Person Name"
                    placeholder="Name of group representative"
                    value={profile.contactName || ''}
                    onChange={e => setProfile(p=>({...p, contactName: e.target.value}))}
                    icon="user"
                    required
                  />
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <Input
                      label="Age"
                      type="number"
                      placeholder="Age"
                      value={profile.age || ''}
                      onChange={e => setProfile(p=>({...p, age: e.target.value}))}
                      icon="user"
                      required
                    />
                    <Input
                      label="Contact Mobile"
                      placeholder="+91 XXXXX XXXXX"
                      value={profile.contactMobile || ''}
                      onChange={e => setProfile(p=>({...p, contactMobile: e.target.value}))}
                      required
                    />
                  </div>
                </div>
              )}

              <Textarea label="Bio" placeholder={basic.type==='group' ? 'Describe your group, what you do, and what events you\'re available for…' : 'Tell others about yourself…'} value={profile.bio} onChange={pUpd('bio')} rows={3} />
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <Input label={basic.type==='group' ? 'Group Rate (₹/hr)' : 'Hourly Rate (₹)'} type="number" placeholder="e.g. 1200" value={profile.rate} onChange={pUpd('rate')} icon="rupee" required />
                <div className="form-group">
                  <label className="form-label">City / Location</label>
                  <select
                    value={profile.location}
                    onChange={pUpd('location')}
                    required
                    style={{ width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc' }}
                  >
                    <option value="">Select City</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:20}}>
                <p className="form-label required" style={{marginBottom:10}}>Select Interests (min. 3)</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {INTERESTS.map(i=>(
                    <button key={i} className={`chip${profile.interests.includes(i)?' active':''}`} onClick={()=>toggleInt(i)}>{i}</button>
                  ))}
                </div>
                <p style={{fontSize:11,color:'var(--c-muted)',marginTop:8}}>{profile.interests.length} / 3 minimum selected</p>
              </div>
              <div style={{display:'flex',gap:10}}>
                <Button onClick={()=>setStep(1)} variant="ghost" icon="arrowLeft">Back</Button>
                <Button onClick={()=>setStep(3)} fullWidth size="lg" iconRight="arrowRight">Continue</Button>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step===3 && (
            <>
              {!complete ? (
                <>
                  <h3 style={{fontWeight:700,fontSize:18,marginBottom:8,color:'var(--c-dark)'}}>Selfie Upload</h3>
                  <p style={{fontSize:13,color:'var(--c-mid)',marginBottom:24}}>Required before your profile goes live. Quick selfie.</p>
                  {!verified ? (
                    <div style={{textAlign:'center'}}>
                      <div className="face-area" onClick={()=>setVerified(true)}>
                        <Icon name="camera" size={34} color="var(--c-muted)"/>
                        <p style={{fontSize:11,color:'var(--c-muted)',marginTop:8}}>Click to scan face</p>
                      </div>
                      <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:24}}>
                        {['✓ Encrypted','✓ Private','✓ Instant'].map(t=><Badge key={t} variant="success">{t}</Badge>)}
                      </div>
                      <div style={{display:'flex',gap:10}}>
                        <Button onClick={()=>setStep(2)} variant="ghost" icon="arrowLeft">Back</Button>
                        <Button onClick={()=>setVerified(true)} fullWidth size="lg" icon="camera">Take Your Selfie</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{textAlign:'center',padding:'20px 0 16px'}}>
                        <div style={{width:80,height:80,background:'#D1FAE5',borderRadius:40,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
                          <Icon name="check" size={36} color="var(--c-success)"/>
                        </div>
                        <p style={{fontWeight:700,color:'var(--c-success)',fontSize:17}}>Verified Successfully!</p>
                        <p style={{fontSize:13,color:'var(--c-muted)',marginTop:5}}>Your identity has been confirmed.</p>
                      </div>

                      {/* Point 2: Gallery Photos Upload */}
                      <div style={{marginBottom:24}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                          <p style={{fontWeight:700,fontSize:14,color:'var(--c-dark)'}}>📸 Gallery Photos</p>
                          <span style={{fontSize:12,color: galleryPhotos.length >= 3 ? 'var(--c-success)' : 'var(--c-warning)', fontWeight:600}}>
                            {galleryPhotos.length}/5 {galleryPhotos.length < 3 ? `(min 3 required)` : '✓'}
                          </span>
                        </div>
                        <p style={{fontSize:12,color:'var(--c-muted)',marginBottom:12}}>Add minimum 3 photos to your profile gallery (max 5).</p>

                        {/* Gallery previews */}
                        {galleryPhotos.length > 0 && (
                          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:12}}>
                            {galleryPhotos.map((img,idx) => (
                              <div key={idx} style={{position:'relative',aspectRatio:'1',borderRadius:10,overflow:'hidden',border:'2px solid var(--c-primary)'}}>
                                <img src={img} alt={`Gallery ${idx+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                <button
                                  onClick={()=>setGalleryPhotos(p=>p.filter((_,i)=>i!==idx))}
                                  style={{position:'absolute',top:3,right:3,width:18,height:18,borderRadius:9,background:'rgba(0,0,0,0.6)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}
                                >
                                  <Icon name="x" size={10} color="#fff"/>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload area */}
                        {galleryPhotos.length < 5 && (
                          <div
                            onClick={()=>document.getElementById('gallery-input').click()}
                            style={{
                              border:'2px dashed var(--c-primary)',borderRadius:12,
                              padding:'16px',textAlign:'center',cursor:'pointer',
                              background:'var(--c-primary-lt)',transition:'all .15s',
                            }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(13,148,136,0.1)'}
                            onMouseLeave={e=>e.currentTarget.style.background='var(--c-primary-lt)'}
                          >
                            <Icon name="camera" size={24} color="var(--c-primary)"/>
                            <p style={{fontSize:13,fontWeight:600,color:'var(--c-primary)',marginTop:6}}>
                              Add Photos ({5 - galleryPhotos.length} remaining)
                            </p>
                            <p style={{fontSize:11,color:'var(--c-muted)',marginTop:2}}>JPG, PNG up to 5MB each</p>
                          </div>
                        )}
                        <input
                          id="gallery-input"
                          type="file"
                          accept="image/*"
                          multiple
                          style={{display:'none'}}
                          onChange={e=>{
                            const files = Array.from(e.target.files)
                            files.forEach(file=>{
                              if(galleryPhotos.length >= 5) return
                              const reader = new FileReader()
                              reader.onload = ev => setGalleryPhotos(p=> p.length < 5 ? [...p, ev.target.result] : p)
                              reader.readAsDataURL(file)
                            })
                            e.target.value = ''
                          }}
                        />
                      </div>

                      <div style={{display:'flex',gap:10}}>
                        <Button onClick={()=>setStep(2)} variant="ghost" icon="arrowLeft">Back</Button>
                        <Button
                          onClick={handleComplete}
                          fullWidth size="lg" icon="check"
                          disabled={galleryPhotos.length < 3}
                          style={{opacity: galleryPhotos.length < 3 ? 0.5 : 1}}
                        >
                          Complete Registration
                        </Button>
                      </div>
                      {galleryPhotos.length < 3 && (
                        <p style={{fontSize:12,color:'var(--c-warning)',textAlign:'center',marginTop:8,fontWeight:600}}>
                          ⚠ Please upload at least 3 gallery photos to continue
                        </p>
                      )}
                    </>
                  )}
                </>
              ) : (
                <SuccessState title="Welcome to Connectly!" message="Your profile is live. Start exploring people." onClose={()=>nav('/')} btnLabel="Go to Home" />
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
