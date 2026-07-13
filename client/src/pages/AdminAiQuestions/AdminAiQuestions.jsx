import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import aiQuestionService from '../../services/aiQuestionService';
import toast from 'react-hot-toast';
import { FiCpu, FiFileText, FiCheckCircle, FiXCircle, FiSave, FiEye, FiRefreshCw } from 'react-icons/fi';

function AdminAiQuestions() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [step, setStep] = useState('select'); // select | preview | done
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [docLoading, setDocLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setDocLoading(true);
    try {
      const data = await aiQuestionService.listDocuments();
      setDocuments(data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setDocLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedDocId) { toast.error('Select a document first'); return; }
    setGenerating(true);
    setStep('select');
    try {
      const data = await aiQuestionService.preview(selectedDocId, questionCount);
      setPreviewQuestions(data.questions);
      setStep('preview');
      toast.success(`Generated ${data.questions.length} questions`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
      setStep('select');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAndSave = async () => {
    if (!selectedDocId) { toast.error('Select a document first'); return; }
    setGenerating(true);
    try {
      const data = await aiQuestionService.generate(selectedDocId, questionCount);
      setPreviewQuestions(data.questions);
      setSavedCount(data.questions.length);
      setStep('done');
      toast.success(`Saved ${data.questions.length} questions to database`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setStep('select');
    setPreviewQuestions([]);
    setSavedCount(0);
  };

  const selectedDoc = documents.find(d => d.id === Number(selectedDocId));

  const steps = [
    { key: 'select', label: 'Select' },
    { key: 'preview', label: 'Preview' },
    { key: 'done', label: 'Done' },
  ];

  return (
    <>
      <Helmet><title>AI Questions Generator - Admin</title></Helmet>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'rgb(var(--text-primary))', margin: 0 }}>
            AI Question Generator
          </h1>
          <button onClick={loadDocuments} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {steps.map((s, i) => {
            const isActive = step === s.key;
            const isPast = steps.findIndex(x => x.key === step) > i;
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%', fontSize: 13, fontWeight: 600,
                  background: isActive ? 'rgb(var(--primary))' : isPast ? 'rgb(var(--primary) / 0.15)' : 'rgb(var(--border))',
                  color: isActive ? '#fff' : isPast ? 'rgb(var(--primary))' : 'rgb(var(--text-tertiary))',
                  transition: 'all 0.2s',
                }}>
                  {isPast ? <FiCheckCircle size={16} /> : i + 1}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'rgb(var(--text-primary))' : 'rgb(var(--text-tertiary))',
                }}>{s.label}</span>
                {i < steps.length - 1 && (
                  <div style={{ width: 40, height: 2, background: isPast ? 'rgb(var(--primary))' : 'rgb(var(--border))', borderRadius: 1 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Select */}
        {step === 'select' && (
          <div className="dash-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgb(var(--primary) / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FiCpu size={20} style={{ color: 'rgb(var(--primary))' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>Generate from Book Content</h2>
                <p style={{ fontSize: 13, color: 'rgb(var(--text-tertiary))', margin: 0 }}>
                  Select a document and use AI to generate multiple-choice questions.
                </p>
              </div>
            </div>

            {/* Document Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(var(--text-secondary))', marginBottom: 6 }}>
                Document
              </label>
              {docLoading ? (
                <div className="dash-select" style={{ opacity: 0.6 }}>Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="dash-select" style={{ opacity: 0.6 }}>
                  No documents found.{' '}
                  <a href="/admin/library" style={{ color: 'rgb(var(--primary))', textDecoration: 'underline' }}>
                    Upload one first
                  </a>.
                </div>
              ) : (
                <select
                  className="dash-select"
                  value={selectedDocId}
                  onChange={e => setSelectedDocId(e.target.value)}
                >
                  <option value="">-- Choose a document --</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.title} ({d.file_url?.split('.').pop()})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Question Count */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgb(var(--text-secondary))', marginBottom: 6 }}>
                Number of Questions
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[5, 10, 15, 20, 25, 30].map(n => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      border: questionCount === n ? '2px solid rgb(var(--primary))' : '1px solid rgb(var(--border))',
                      background: questionCount === n ? 'rgb(var(--primary) / 0.08)' : 'transparent',
                      color: questionCount === n ? 'rgb(var(--primary))' : 'rgb(var(--text-secondary))',
                      transition: 'all 0.15s',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Info Card */}
            {selectedDoc && (
              <div style={{
                background: 'rgb(var(--text-primary) / 0.03)', border: '1px solid rgb(var(--border))',
                borderRadius: 10, padding: '14px 18px', marginBottom: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: selectedDoc.description ? 4 : 0 }}>
                  <FiFileText size={16} style={{ color: 'rgb(var(--primary))' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(var(--text-primary))' }}>{selectedDoc.title}</span>
                </div>
                {selectedDoc.description && (
                  <p style={{ fontSize: 13, color: 'rgb(var(--text-tertiary))', margin: '4px 0 0 24px' }}>
                    {selectedDoc.description}
                  </p>
                )}
                <p style={{ fontSize: 12, color: 'rgb(var(--text-tertiary))', margin: '6px 0 0 24px' }}>
                  <span className="badge-info" style={{ marginRight: 6 }}>{selectedDoc.file_type}</span>
                  {selectedDoc.category_name || 'No category'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handlePreview} disabled={!selectedDocId || generating} className="btn-secondary">
                <FiEye size={15} style={{ marginRight: 6 }} />
                {generating ? 'Generating...' : 'Preview'}
              </button>
              <button onClick={handleGenerateAndSave} disabled={!selectedDocId || generating} className="btn-primary">
                <FiSave size={15} style={{ marginRight: 6 }} />
                {generating ? 'Generating & Saving...' : 'Generate & Save'}
              </button>
            </div>

            {/* Idle hint */}
            {step === 'select' && !generating && documents.length > 0 && (
              <div style={{
                marginTop: 28, textAlign: 'center', padding: '24px 0',
                borderTop: '1px solid rgb(var(--border))',
              }}>
                <FiCpu size={28} style={{ color: 'rgb(var(--text-tertiary))', marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: 'rgb(var(--text-tertiary))', margin: 0 }}>
                  Select a document, then choose Preview or Generate & Save
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {generating && (
          <div className="dash-card" style={{ padding: '60px 28px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, border: '4px solid rgb(var(--border))',
              borderTopColor: 'rgb(var(--primary))', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'rgb(var(--text-primary))', marginBottom: 4 }}>
              AI is generating questions from the book content...
            </p>
            <p style={{ fontSize: 13, color: 'rgb(var(--text-tertiary))', margin: 0 }}>
              This may take 30–60 seconds
            </p>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && !generating && previewQuestions.length > 0 && (
          <div className="dash-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiEye size={18} style={{ color: 'rgb(var(--primary))' }} />
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'rgb(var(--text-primary))', margin: 0 }}>
                  Preview
                </h2>
                <span className="badge-info">{previewQuestions.length} questions</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleGenerateAndSave} className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
                  <FiSave size={14} style={{ marginRight: 4 }} /> Save All
                </button>
                <button onClick={reset} className="btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }}>
                  Cancel
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgb(var(--warning) / 0.08)', border: '1px solid rgb(var(--warning) / 0.2)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13,
              color: 'rgb(var(--text-secondary))',
            }}>
              These questions are <strong>not saved yet</strong>. Click "Save All" to add them to the question bank.
            </div>

            <div style={{ maxHeight: 600, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {previewQuestions.map((q, i) => {
                const correctIdx = { a: 0, b: 1, c: 2, d: 3 }[q.correct_answer?.toLowerCase()];
                return (
                  <div key={i} style={{
                    border: '1px solid rgb(var(--border))', borderRadius: 10, padding: 16,
                    transition: 'border-color 0.15s',
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: 12 }}>
                      {i + 1}. {q.question_text}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                      {['option_a', 'option_b', 'option_c', 'option_d'].map((key, idx) => {
                        const letter = String.fromCharCode(97 + idx);
                        const isCorrect = idx === correctIdx;
                        return (
                          <div key={key} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px', borderRadius: 8, fontSize: 13,
                            background: isCorrect ? 'rgb(34 197 94 / 0.08)' : 'rgb(var(--text-primary) / 0.03)',
                            border: isCorrect ? '1px solid rgb(34 197 94 / 0.25)' : '1px solid rgb(var(--border))',
                            color: isCorrect ? 'rgb(22 163 74)' : 'rgb(var(--text-secondary))',
                            fontWeight: isCorrect ? 600 : 400,
                          }}>
                            {isCorrect
                              ? <FiCheckCircle size={15} style={{ color: 'rgb(22 163 74)', flexShrink: 0 }} />
                              : <FiXCircle size={15} style={{ color: 'rgb(var(--text-tertiary))', flexShrink: 0 }} />
                            }
                            <span>{letter.toUpperCase()}. {q[key]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && !generating && (
          <div className="dash-card" style={{ padding: '48px 28px', textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgb(34 197 94 / 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <FiCheckCircle size={36} style={{ color: 'rgb(22 163 74)' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(var(--text-primary))', margin: '0 0 8px' }}>
              Questions Saved!
            </h2>
            <p style={{ fontSize: 14, color: 'rgb(var(--text-secondary))', margin: '0 0 4px' }}>
              {savedCount} new questions added to the question bank.
            </p>
            <p style={{ fontSize: 13, color: 'rgb(var(--text-tertiary))', margin: '0 0 28px' }}>
              These questions will appear in future free tests.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: previewQuestions.length > 0 ? 28 : 0 }}>
              <button onClick={reset} className="btn-primary">
                Generate More
              </button>
              <a href="/free-test" className="btn-secondary" style={{ textDecoration: 'none' }}>
                Try a Free Test
              </a>
            </div>

            {previewQuestions.length > 0 && (
              <details style={{ textAlign: 'left' }}>
                <summary style={{
                  fontSize: 13, color: 'rgb(var(--text-tertiary))', cursor: 'pointer',
                  padding: '8px 0',
                }}>
                  View generated questions
                </summary>
                <div style={{ marginTop: 12, maxHeight: 384, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {previewQuestions.map((q, i) => {
                    const correctIdx = { a: 0, b: 1, c: 2, d: 3 }[q.correct_answer?.toLowerCase()];
                    return (
                      <div key={i} style={{
                        border: '1px solid rgb(var(--border))', borderRadius: 8, padding: 14, fontSize: 13,
                      }}>
                        <p style={{ fontWeight: 600, color: 'rgb(var(--text-primary))', marginBottom: 8, margin: '0 0 8px' }}>
                          {i + 1}. {q.question_text}
                        </p>
                        {['option_a', 'option_b', 'option_c', 'option_d'].map((key, idx) => {
                          const letter = String.fromCharCode(97 + idx);
                          const isCorrect = idx === correctIdx;
                          return (
                            <div key={key} style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '4px 0',
                              color: isCorrect ? 'rgb(22 163 74)' : 'rgb(var(--text-tertiary))',
                              fontWeight: isCorrect ? 600 : 400,
                            }}>
                              {isCorrect ? <FiCheckCircle size={12} /> : <span style={{ width: 12 }} />}
                              <span>{letter.toUpperCase()}. {q[key]}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminAiQuestions;
