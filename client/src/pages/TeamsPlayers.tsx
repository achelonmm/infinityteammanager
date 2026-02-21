import React, { useState } from 'react';
import { useTournament } from '../contexts/TournamentContext';
import EditTeamForm from '../components/EditTeamForm';
import EditPlayerForm from '../components/EditPlayerForm';
import { Team, Player } from '../types';

const TeamsPlayers: React.FC = () => {
  const { tournament, getTeams, getPlayers, deleteTeam, updateTeam, updatePlayer, loading, error } = useTournament();
  const [activeTab, setActiveTab] = useState<'teams' | 'players'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArmy, setFilterArmy] = useState('');
  
  // Edit modal states
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  // Get fresh data - this will re-run whenever tournament context updates
  const teams = getTeams();
  const players = getPlayers();

  // Get unique armies for filter
  const uniqueArmies = Array.from(new Set(players.map(p => p.army))).sort();

  // Filter players based on search and army filter
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teams.find(t => t.id === player.teamId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArmy = !filterArmy || player.army === filterArmy;
    return matchesSearch && matchesArmy;
  });

  // Filter teams based on search
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.players.some(player => player.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (window.confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) {
      try {
        await deleteTeam(teamId);
        
        // Success notification
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success';
        successAlert.style.position = 'fixed';
        successAlert.style.top = '20px';
        successAlert.style.right = '20px';
        successAlert.style.zIndex = '1000';
        successAlert.innerHTML = '<strong>🗑️ Deleted!</strong> Team removed successfully!';
        document.body.appendChild(successAlert);
        
        setTimeout(() => {
          if (document.body.contains(successAlert)) {
            document.body.removeChild(successAlert);
          }
        }, 3000);
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Error deleting team. Please try again.');
      }
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
  };

  const handleSaveTeam = async (teamId: string, updates: { name: string; captainId: string; players?: any[] }) => {
    try {
      await updateTeam(teamId, updates);
      setEditingTeam(null);
      
      // Success notification
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success';
      successAlert.style.position = 'fixed';
      successAlert.style.top = '20px';
      successAlert.style.right = '20px';
      successAlert.style.zIndex = '1000';
      successAlert.innerHTML = '<strong>✏️ Updated!</strong> Team updated successfully!';
      document.body.appendChild(successAlert);
      
      setTimeout(() => {
        if (document.body.contains(successAlert)) {
          document.body.removeChild(successAlert);
        }
      }, 3000);
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
  };

  const handleSavePlayer = async (playerId: string, updates: Partial<Player>) => {
    try {
      await updatePlayer(playerId, updates);
      setEditingPlayer(null);
      
      // Success notification
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success';
      successAlert.style.position = 'fixed';
      successAlert.style.top = '20px';
      successAlert.style.right = '20px';
      successAlert.style.zIndex = '1000';
      successAlert.innerHTML = '<strong>✏️ Updated!</strong> Player updated successfully!';
      document.body.appendChild(successAlert);
      
      setTimeout(() => {
        if (document.body.contains(successAlert)) {
          document.body.removeChild(successAlert);
        }
      }, 3000);
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  };

  const tabStyle = (isActive: boolean) => ({
    padding: 'var(--spacing-4) var(--spacing-6)',
    border: 'none',
    background: isActive ? 
      'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' : 
      'var(--color-neutral-200)',
    color: isActive ? 'white' : 'var(--color-neutral-700)',
    cursor: 'pointer',
    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
    marginRight: 'var(--spacing-2)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-medium)',
    transition: 'all var(--transition-fast)',
    position: 'relative' as const,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)'
  });

  const teamCardStyle = {
    background: 'linear-gradient(135deg, white, var(--color-neutral-50))',
    border: '1px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-6)',
    marginBottom: 'var(--spacing-4)',
    transition: 'all var(--transition-base)',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const playerRowStyle = (index: number) => ({
    background: index % 2 === 0 ? 'white' : 'var(--color-neutral-50)',
    transition: 'all var(--transition-fast)',
    borderRadius: 'var(--radius-base)'
  });

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
          Teams & Players Management
        </h2>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto var(--spacing-4)' }}></div>
          <p style={{ color: 'var(--color-neutral-600)' }}>Loading teams and players...</p>
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
          Teams & Players Management
        </h2>
        <div className="alert alert-error">
          <strong>⚠️ Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <>
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
          👥 Teams & Players Management
        </h2>
        
        {/* Search and Filter Bar */}
        <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 'var(--spacing-4)',
            alignItems: 'end'
          }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                <span>🔍</span> Search:
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                placeholder="Search teams or players..."
              />
            </div>
            
            {activeTab === 'players' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <span>⚔️</span> Filter by Army:
                </label>
                <select
                  value={filterArmy}
                  onChange={(e) => setFilterArmy(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Armies</option>
                  {uniqueArmies.map(army => (
                    <option key={army} value={army}>{army}</option>
                  ))}
                </select>
              </div>
            )}
            
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterArmy('');
              }}
              className="btn btn-outline"
              style={{ height: 'fit-content' }}
            >
              <span>🔄</span>
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div style={{ marginBottom: 'var(--spacing-2)' }}>
          <button 
            style={tabStyle(activeTab === 'teams')}
            onClick={() => setActiveTab('teams')}
            onMouseEnter={(e) => {
              if (activeTab !== 'teams') {
                e.currentTarget.style.background = 'var(--color-neutral-300)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'teams') {
                e.currentTarget.style.background = 'var(--color-neutral-200)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <span>🏢</span>
            Teams ({filteredTeams.length})
          </button>
          <button 
            style={tabStyle(activeTab === 'players')}
            onClick={() => setActiveTab('players')}
            onMouseEnter={(e) => {
              if (activeTab !== 'players') {
                e.currentTarget.style.background = 'var(--color-neutral-300)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'players') {
                e.currentTarget.style.background = 'var(--color-neutral-200)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <span>🎮</span>
            Players ({filteredPlayers.length})
          </button>
        </div>

        <div className="card" style={{ maxWidth: '1200px', position: 'relative' }}>
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
            </div>
          )}

          {activeTab === 'teams' ? (
            <div className="animate-fade-in">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 'var(--spacing-6)',
                paddingBottom: 'var(--spacing-4)',
                borderBottom: '2px solid var(--color-neutral-200)'
              }}>
                <h3 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)'
                }}>
                  <span>🏢</span>
                  Teams Management
                </h3>
                <a
                  href="/registration"
                  className="btn btn-success"
                >
                  <span>➕</span>
                  Add New Team
                </a>
              </div>
              
              {filteredTeams.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--spacing-12)',
                  background: 'linear-gradient(135deg, var(--color-neutral-50), white)',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px dashed var(--color-neutral-300)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
                    {searchTerm ? '🔍' : '🎪'}
                  </div>
                  <p style={{ 
                    color: 'var(--color-neutral-600)',
                    fontSize: 'var(--font-size-lg)',
                    marginBottom: 'var(--spacing-4)'
                  }}>
                    {searchTerm ? 'No teams found matching your search.' : 'No teams registered yet.'}
                  </p>
                  {!searchTerm && (
                    <a href="/registration" className="btn btn-primary">
                      <span>🚀</span>
                      Register the first team
                    </a>
                  )}
                </div>
              ) : (
                <div>
                  {filteredTeams.map((team) => {
                    const captain = team.players.find(p => p.isCaptain);
                    return (
                      <div 
                        key={team.id} 
                        style={teamCardStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'auto 1fr auto', 
                          gap: 'var(--spacing-4)',
                          alignItems: 'center'
                        }}>
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--font-size-2xl)',
                            color: 'white',
                            fontWeight: 'var(--font-weight-bold)'
                          }}>
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div>
                            <h4 style={{ 
                              fontSize: 'var(--font-size-xl)',
                              fontWeight: 'var(--font-weight-bold)',
                              color: 'var(--color-primary)',
                              margin: '0 0 var(--spacing-2) 0'
                            }}>
                              {team.name}
                            </h4>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                              gap: 'var(--spacing-4)',
                              fontSize: 'var(--font-size-sm)',
                              color: 'var(--color-neutral-600)'
                            }}>
                              <div>
                                <strong>👑 Captain:</strong> {captain?.nickname || 'No captain assigned'}
                              </div>
                              <div>
                                <strong>👥 Players:</strong> {team.players.map(p => p.nickname).join(', ')}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleEditTeam(team)}
                              style={{ fontSize: 'var(--font-size-sm)' }}
                            >
                              <span>✏️</span>
                              Edit
                            </button>
                            <button
                              className="btn btn-warning"
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                              style={{ fontSize: 'var(--font-size-sm)' }}
                            >
                              <span>🗑️</span>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 'var(--spacing-6)',
                paddingBottom: 'var(--spacing-4)',
                borderBottom: '2px solid var(--color-neutral-200)'
              }}>
                <h3 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)'
                }}>
                  <span>🎮</span>
                  Players Management
                </h3>
                <button
                  className="btn btn-success"
                  onClick={() => alert('Add individual player functionality coming soon!')}
                >
                  <span>➕</span>
                  Add New Player
                </button>
              </div>
              
              {filteredPlayers.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--spacing-12)',
                  background: 'linear-gradient(135deg, var(--color-neutral-50), white)',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px dashed var(--color-neutral-300)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-4)' }}>
                    {searchTerm || filterArmy ? '🔍' : '🎮'}
                  </div>
                  <p style={{ 
                    color: 'var(--color-neutral-600)',
                    fontSize: 'var(--font-size-lg)'
                  }}>
                    {searchTerm || filterArmy ? 'No players found matching your filters.' : 'No players registered yet. Register teams first to see players here.'}
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Team</th>
                        <th>Army</th>
                        <th>ITS Pin</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((player, index) => {
                        const team = teams.find(t => t.id === player.teamId);
                        return (
                          <tr 
                            key={player.id} 
                            style={playerRowStyle(index)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--color-primary-light)';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.transform = 'scale(1.01)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = index % 2 === 0 ? 'white' : 'var(--color-neutral-50)';
                              e.currentTarget.style.color = 'inherit';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: player.isCaptain ? 
                                    'linear-gradient(135deg, var(--color-warning), var(--color-warning-light))' :
                                    'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-light))',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'var(--font-weight-bold)',
                                  fontSize: 'var(--font-size-sm)'
                                }}>
                                  {player.isCaptain ? '👑' : player.nickname.charAt(0).toUpperCase()}
                                </div>
                                <strong>{player.nickname}</strong>
                              </div>
                            </td>
                            <td>{team?.name || 'Unknown'}</td>
                            <td>
                              <span style={{ 
                                background: 'var(--color-neutral-100)',
                                padding: 'var(--spacing-1) var(--spacing-3)',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-medium)'
                              }}>
                                {player.army}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'var(--font-family-mono)' }}>{player.itsPin}</td>
                            <td>
                              {player.isCaptain ? (
                                <span style={{ 
                                  background: 'linear-gradient(135deg, var(--color-warning), var(--color-warning-light))', 
                                  color: 'white', 
                                  padding: 'var(--spacing-2) var(--spacing-3)', 
                                  borderRadius: 'var(--radius-full)', 
                                  fontSize: 'var(--font-size-sm)',
                                  fontWeight: 'var(--font-weight-medium)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--spacing-1)',
                                  width: 'fit-content'
                                }}>
                                  <span>👑</span>
                                  Captain
                                </span>
                              ) : (
                                <span style={{ color: 'var(--color-neutral-600)' }}>Player</span>
                              )}
                            </td>
                            <td>
                              {player.isPainted ? (
                                <span style={{ 
                                  background: 'linear-gradient(135deg, var(--color-success), var(--color-success-light))', 
                                  color: 'white', 
                                  padding: 'var(--spacing-1) var(--spacing-3)', 
                                  borderRadius: 'var(--radius-full)', 
                                  fontSize: 'var(--font-size-xs)',
                                  fontWeight: 'var(--font-weight-medium)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--spacing-1)',
                                  width: 'fit-content'
                                }}>
                                  <span>🎨</span>
                                  Painted
                                </span>
                              ) : (
                                <span style={{ 
                                  color: 'var(--color-neutral-500)',
                                  fontSize: 'var(--font-size-sm)'
                                }}>
                                  Unpainted
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleEditPlayer(player)}
                                style={{ fontSize: 'var(--font-size-sm)' }}
                              >
                                <span>✏️</span>
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Team Modal */}
      {editingTeam && (
        <EditTeamForm
          team={editingTeam}
          onSave={handleSaveTeam}
          onCancel={() => setEditingTeam(null)}
        />
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <EditPlayerForm
          player={editingPlayer}
          team={teams.find(t => t.id === editingPlayer.teamId)!}
          allTeams={teams}
          onSave={handleSavePlayer}
          onCancel={() => setEditingPlayer(null)}
        />
      )}
    </>
  );
};

export default TeamsPlayers;