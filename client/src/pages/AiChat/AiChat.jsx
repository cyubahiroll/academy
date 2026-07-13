import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import aiChatService from '../../services/aiChatService';
import {
  FiSend, FiCpu, FiUser, FiRefreshCw, FiBook, FiDatabase, FiGlobe,
  FiAlertCircle, FiShield, FiHelpCircle, FiCheckCircle, FiArrowRight, FiArrowLeft
} from 'react-icons/fi';

function AiChat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef(null);

  const LEARNING_TIPS = [
    {
      icon: <FiBook size={16} />,
      text: t('aiChat.quickActions.explain'),
      desc: t('aiChat.quickActions.explainDesc'),
    },
    {
      icon: <FiHelpCircle size={16} />,
      text: t('aiChat.quickActions.whyWrong'),
      desc: t('aiChat.quickActions.whyWrongDesc'),
    },
    {
      icon: <FiArrowRight size={16} />,
      text: t('aiChat.quickActions.example'),
      desc: t('aiChat.quickActions.exampleDesc'),
    },
    {
      icon: <FiCheckCircle size={16} />,
      text: t('aiChat.quickActions.testMe'),
      desc: t('aiChat.quickActions.testMeDesc'),
    },
    {
      icon: <FiShield size={16} />,
      text: t('aiChat.quickActions.safety'),
      desc: t('aiChat.quickActions.safetyDesc'),
    },
    {
      icon: <FiBook size={16} />,
      text: t('aiChat.quickActions.stepByStep'),
      desc: t('aiChat.quickActions.stepByStepDesc'),
    },
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await aiChatService.getHistory();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg = { id: Date.now(), role: 'user', message: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await aiChatService.ask(text);
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        message: data.reply,
        sources: data.sources || [],
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        message: err.response?.data?.message || t('aiChat.errorMessage'),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const renderMessageContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      <Helmet><title>{t('aiChat.pageTitle')}</title></Helmet>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'rgb(var(--text-tertiary))' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgb(var(--sidebar-hover))'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{t('aiChat.title')}</h1>
                <span className="badge badge-info">
                  {t('aiChat.teacherMode')}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                {t('aiChat.subtitle')}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={handleNewChat} className="btn-ghost">
              <FiRefreshCw size={16} /> {t('aiChat.newChat')}
            </button>
          )}
        </div>

        {/* Chat Container */}
        <div
          className="flex-1 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'rgb(var(--card-bg))',
            border: '1px solid rgb(var(--card-border))',
            boxShadow: '0 4px 24px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-4 rounded-full" style={{ borderColor: 'rgb(var(--border))', borderTopColor: 'rgb(var(--input-focus))' }} />
              </div>
            ) : messages.length === 0 ? (
              /* Welcome / Empty State */
              <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgb(99 102 241 / 0.1)' }}
                >
                  <FiCpu size={28} style={{ color: 'rgb(var(--input-focus))' }} />
                </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{t('aiChat.welcomeTitle')}</h2>
                <p className="max-w-md mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {t('aiChat.welcomeDesc')}
                </p>

                {/* Quick Learning Actions */}
                <div className="w-full max-w-lg mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    {t('aiChat.tryAsking')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-stagger">
                    {LEARNING_TIPS.map((tip, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(tip.text)}
                        className="flex items-start gap-2.5 text-left text-sm px-3.5 py-3 rounded-xl transition-all duration-200 group"
                        style={{
                          background: 'rgb(var(--surface-elevated))',
                          border: '1px solid rgb(var(--border))',
                          color: 'rgb(var(--text-secondary))',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgb(var(--input-focus))';
                          e.currentTarget.style.background = 'rgb(99 102 241 / 0.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgb(var(--border))';
                          e.currentTarget.style.background = 'rgb(var(--surface-elevated))';
                        }}
                      >
                        <span className="mt-0.5 shrink-0 transition-colors" style={{ color: 'rgb(var(--input-focus))' }}>
                          {tip.icon}
                        </span>
                        <div className="min-w-0">
                          <span className="block font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{tip.text}</span>
                          <span className="block text-xs mt-0.5" style={{ color: 'rgb(var(--text-tertiary))' }}>{tip.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="w-full max-w-lg">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    {t('aiChat.orAskDirectly')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      t('aiChat.quickQuestions.redLight'),
                      t('aiChat.quickQuestions.speedLimit'),
                      t('aiChat.quickQuestions.roundabout'),
                      t('aiChat.quickQuestions.documents'),
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="text-left text-sm px-4 py-3 rounded-xl transition-all duration-200"
                        style={{
                          background: 'rgb(var(--surface-elevated))',
                          border: '1px solid rgb(var(--border))',
                          color: 'rgb(var(--text-secondary))',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgb(var(--input-focus))';
                          e.currentTarget.style.background = 'rgb(99 102 241 / 0.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgb(var(--border))';
                          e.currentTarget.style.background = 'rgb(var(--surface-elevated))';
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message List */
              messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                      style={{ background: 'rgb(99 102 241 / 0.1)' }}
                    >
                      <FiCpu size={16} style={{ color: 'rgb(var(--input-focus))' }} />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                      style={msg.role === 'user'
                        ? {
                            background: 'rgb(var(--input-focus))',
                            color: '#fff',
                            borderRadius: '1rem 1rem 0.25rem 1rem',
                          }
                        : {
                            background: 'rgb(var(--surface-elevated))',
                            color: 'rgb(var(--text-primary))',
                            border: '1px solid rgb(var(--border))',
                            borderRadius: '1rem 1rem 1rem 0.25rem',
                          }
                      }
                    >
                      {msg.role === 'user' ? msg.message : renderMessageContent(msg.message)}
                    </div>

                    {/* Sources */}
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.sources.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5"
                            style={{
                              color: 'rgb(var(--text-tertiary))',
                              background: 'rgb(var(--surface-elevated))',
                              border: '1px solid rgb(var(--border))',
                            }}
                          >
                            {s.type === 'book' ? <FiBook size={12} className="text-amber-500 shrink-0" />
                              : s.type === 'database' ? <FiDatabase size={12} className="text-blue-500 shrink-0" />
                              : s.type === 'internet' ? <FiGlobe size={12} className="text-green-500 shrink-0" />
                              : <FiAlertCircle size={12} style={{ color: 'rgb(var(--text-tertiary))' }} className="shrink-0" />}
                            <span className="truncate">{s.title}</span>
                            {s.url && (
                              <a href={s.url} target="_blank" rel="noopener noreferrer"
                                className="hover:underline ml-auto shrink-0"
                                style={{ color: 'rgb(var(--input-focus))' }}
                              >{t('aiChat.link')}</a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-right' : ''}`} style={{ color: 'rgb(var(--text-tertiary))' }}>
                      {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                      style={{ background: 'rgb(var(--border))' }}
                    >
                      <FiUser size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 animate-slide-up">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                  style={{ background: 'rgb(99 102 241 / 0.1)' }}
                >
                  <FiCpu size={16} style={{ color: 'rgb(var(--input-focus))' }} />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-md"
                  style={{
                    background: 'rgb(var(--surface-elevated))',
                    border: '1px solid rgb(var(--border))',
                  }}
                >
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgb(var(--input-focus))', animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgb(var(--input-focus))', animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'rgb(var(--input-focus))', animationDelay: '300ms' }} />
                    </div>
                    <span>{t('aiChat.teaching')}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="p-4"
            style={{
              borderTop: '1px solid rgb(var(--border))',
              background: 'rgb(var(--card-bg))',
            }}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={t('aiChat.inputPlaceholder')}
                disabled={loading}
                className="dash-input flex-1"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="btn-primary px-5"
              >
                <FiSend size={16} /> {t('aiChat.send')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AiChat;
