import React from 'react';
import { useTournament } from '../contexts/TournamentContext';

const Dashboard: React.FC = () => {
  const { getTeams, getPlayers, tournament, loading, error } = useTournament();
  
  if (loading) {
    return (
      <div className="container">
        <h2 style={{ 
          marginBottom: 'var(--spacing-8)', 
          color: 'var(--color-primary)',
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center'
        }}>
          Tournament Dashboard
        </h2>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto var(--spacing-4)' }}></div>
          <p style={{ color: 'var(--color-neutral-600)' }}>Loading tournament data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2 style={{ 
          marginBottom: 'var(--spacing-8)', 
          color: 'var(--color-primary)',
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center'
        }}>
          Tournament Dashboard
        </h2>
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }
  
  const teams = getTeams();
  const players = getPlayers();
  
  // Calculate army distribution
  const armyDistribution = players.reduce((acc, player) => {
    acc[player.army] = (acc[player.army] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statCardStyle = {
    background: 'linear-gradient(135deg, white, var(--color-neutral-50))',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    padding: 'var(--spacing-6)',
    textAlign: 'center' as const,
    transition: 'all var(--transition-base)',
    border: '1px solid var(--color-neutral-200)',
    position: 'relative' as const,
    overflow: 'hidden',
  };

  const statIconStyle = {
    fontSize: 'var(--font-size-3xl)',
    marginBottom: 'var(--spacing-4)',
    display: 'block',
  };

  const statValueStyle = {
    fontSize: 'var(--font-size-4xl)',
    fontWeight: 'var(--font-weight-bold)',
    margin: 'var(--spacing-2) 0',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: 'none',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--spacing-6)',
    marginBottom: 'var(--spacing-8)',
  };

  return (
    <div className="container animate-fade-in">
      <h2 style={{ 
        marginBottom: 'var(--spacing-8)', 
        color: 'var(--color-primary)',
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        🏆 Tournament Dashboard
      </h2>
      
      <div style={gridStyle}>
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
        >
          <span style={statIconStyle}>👥</span>
          <h3 style={{ 
            color: 'var(--color-primary)', 
            marginBottom: 'var(--spacing-2)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            Total Teams
          </h3>
          <p style={statValueStyle}>{teams.length}</p>
        </div>
        
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
        >
          <span style={statIconStyle}>🎮</span>
          <h3 style={{ 
            color: 'var(--color-secondary)', 
            marginBottom: 'var(--spacing-2)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            Total Players
          </h3>
          <p style={statValueStyle}>{players.length}</p>
        </div>
        
        <div 
          style={statCardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
        >
          <span style={statIconStyle}>🎯</span>
          <h3 style={{ 
            color: 'var(--color-warning)', 
            marginBottom: 'var(--spacing-2)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            Current Round
          </h3>
          <p style={statValueStyle}>{tournament?.currentRound || 1}</p>
        </div>
      </div>

      <div className="card animate-slide-in">
        <h3 style={{ 
          marginBottom: 'var(--spacing-6)',
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-3)'
        }}>
          <span>🚀</span>
          Tournament Status
        </h3>
        
        {teams.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-8)',
            background: 'linear-gradient(135deg, var(--color-neutral-50), white)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--color-neutral-300)'
          }}>
            <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
              🎪
            </div>
            <p style={{ 
              marginBottom: 'var(--spacing-4)', 
              color: 'var(--color-neutral-600)',
              fontSize: 'var(--font-size-lg)'
            }}>
              No teams registered yet. Start by registering teams for the tournament.
            </p>
            <a 
              href="/registration" 
              className="btn btn-primary"
              style={{
                fontSize: 'var(--font-size-lg)',
                padding: 'var(--spacing-4) var(--spacing-8)'
              }}
            >
              <span>➕</span>
              Register First Team
            </a>
          </div>
        ) : (
          <div>
            <div style={{
              padding: 'var(--spacing-4)',
              background: 'linear-gradient(135deg, var(--color-success-light), var(--color-success))',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--spacing-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)'
            }}>
              <span style={{ fontSize: 'var(--font-size-2xl)' }}>✅</span>
              <div>
                <strong>Tournament Progress:</strong> {teams.length} teams registered, ready for pairings.
              </div>
            </div>
            
            {Object.keys(armyDistribution).length > 0 && (
              <div style={{ marginTop: 'var(--spacing-6)' }}>
                <h4 style={{ 
                  marginBottom: 'var(--spacing-4)',
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)'
                }}>
                  <span>⚔️</span>
                  Army Distribution
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                  gap: 'var(--spacing-3)'
                }}>
                  {Object.entries(armyDistribution).map(([army, count]) => (
                    <div key={army} style={{ 
                      background: 'linear-gradient(135deg, var(--color-neutral-50), white)', 
                      padding: 'var(--spacing-4)', 
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--color-neutral-200)',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{army}</span>
                      <strong style={{ 
                        color: 'var(--color-primary)',
                        background: 'var(--color-primary)',
                        padding: 'var(--spacing-1) var(--spacing-3)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        {count}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;