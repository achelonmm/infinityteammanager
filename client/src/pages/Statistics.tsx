import React, { useState } from 'react';
import { useTournament } from '../contexts/TournamentContext';
import { calculateTournamentStats } from '../utils/statisticsUtils';

const Statistics: React.FC = () => {
  const { getTeams, getPlayers, tournament } = useTournament();
  const [activeTab, setActiveTab] = useState<'overview' | 'armies' | 'players' | 'achievements'>('overview');
  
  const teams = getTeams();
  const players = getPlayers();
  const teamMatches = tournament?.teamMatches || [];
  const currentRound = tournament?.currentRound || 1;

  const stats = calculateTournamentStats(teams, players, teamMatches, currentRound);

  const tabStyle = (isActive: boolean) => ({
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: isActive ? '#1a237e' : '#e0e0e0',
    color: isActive ? 'white' : '#666',
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
    marginRight: '4px',
    fontSize: '0.9rem'
  });

  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    marginBottom: '1rem'
  };

  const statCardStyle = {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    textAlign: 'center' as const,
    margin: '0.5rem'
  };

  const progressBarStyle = (percentage: number, color: string) => ({
    width: '100%',
    height: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative' as const
  });

  const progressFillStyle = (percentage: number, color: string) => ({
    width: `${Math.min(percentage, 100)}%`,
    height: '100%',
    backgroundColor: color,
    transition: 'width 0.3s ease'
  });

  const getArmyColor = (index: number) => {
    const colors = ['#1a237e', '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#607d8b', '#795548', '#ff5722', '#3f51b5', '#009688'];
    return colors[index % colors.length];
  };

  const renderOverview = () => (
    <div>
      {/* Key Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={statCardStyle}>
          <h3 style={{ color: '#1a237e', marginBottom: '0.5rem' }}>Total Teams</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', margin: 0 }}>
            {stats.totalTeams}
          </p>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ color: '#1a237e', marginBottom: '0.5rem' }}>Total Players</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>
            {stats.totalPlayers}
          </p>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ color: '#1a237e', marginBottom: '0.5rem' }}>Current Round</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800', margin: 0 }}>
            {stats.currentRound}
          </p>
        </div>
        
        <div style={statCardStyle}>
          <h3 style={{ color: '#1a237e', marginBottom: '0.5rem' }}>Match Completion</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9c27b0', margin: 0 }}>
            {stats.totalMatches > 0 ? Math.round((stats.completedMatches / stats.totalMatches) * 100) : 0}%
          </p>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
            {stats.completedMatches} / {stats.totalMatches}
          </p>
        </div>
      </div>

      {/* Tournament Progress */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '1rem' }}>Tournament Progress</h3>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Matches Completed</span>
            <span>{stats.completedMatches} / {stats.totalMatches}</span>
          </div>
          <div style={progressBarStyle(0, '#4caf50')}>
            <div style={progressFillStyle(
              stats.totalMatches > 0 ? (stats.completedMatches / stats.totalMatches) * 100 : 0, 
              '#4caf50'
            )}></div>
          </div>
        </div>
        
        {stats.totalRounds > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Round Progress</span>
              <span>Round {stats.currentRound} {stats.totalRounds > 1 ? `of ${stats.totalRounds}` : ''}</span>
            </div>
            <div style={progressBarStyle(0, '#2196f3')}>
              <div style={progressFillStyle(
                stats.totalRounds > 0 ? ((stats.currentRound - 1) / Math.max(stats.totalRounds, stats.currentRound)) * 100 : 0, 
                '#2196f3'
              )}></div>
            </div>
          </div>
        )}
      </div>

      {/* Army Distribution Chart */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '1.5rem' }}>Army Distribution</h3>
        {stats.armyDistribution.length > 0 ? (
          <div>
            {stats.armyDistribution.map((army, index) => (
              <div key={army.army} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{army.army}</span>
                  <span>{army.count} players ({army.percentage.toFixed(1)}%)</span>
                </div>
                <div style={progressBarStyle(army.percentage, getArmyColor(index))}>
                  <div style={progressFillStyle(army.percentage, getArmyColor(index))}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center' }}>No army data available yet.</p>
        )}
      </div>
    </div>
  );

  const renderArmies = () => (
    <div style={cardStyle}>
      <h3 style={{ marginBottom: '1.5rem' }}>Army Performance Analysis</h3>
      {stats.armyPerformance.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Army</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Players</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Games</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Win Rate</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Avg Objective</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Avg Kill Ratio</th>
              </tr>
            </thead>
            <tbody>
              {stats.armyPerformance.map((army, index) => (
                <tr key={army.army} style={{ background: index % 2 === 0 ? '#fafafa' : 'white' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                    {army.army}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    {army.players.length}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    {army.gamesPlayed}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    <span style={{ 
                      color: army.winRate >= 60 ? '#4caf50' : army.winRate >= 40 ? '#ff9800' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {army.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    {army.averageObjectivePoints.toFixed(1)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                    {army.averageKillRatio.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
          No army performance data available yet. Complete some matches to see statistics.
        </p>
      )}
    </div>
  );

  const renderPlayers = () => (
    <div>
      {/* Top Performers */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: '1.5rem' }}>Top Performers (by Win Rate)</h3>
        {stats.topPerformers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Player</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Army</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Games</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Win Rate</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Avg Obj</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Kill Ratio</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Total Pts</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPerformers.map((performance, index) => (
                  <tr key={performance.player.id} style={{ 
                    background: index < 3 ? (index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32') : 
                               index % 2 === 0 ? '#fafafa' : 'white'
                  }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                      {index < 3 && <span style={{ marginRight: '0.5rem' }}>#{index + 1}</span>}
                      {performance.player.nickname}
                      {performance.player.isCaptain && (
                        <span style={{
                          marginLeft: '0.5rem',
                          background: '#4caf50',
                          color: 'white',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '3px',
                          fontSize: '0.7rem'
                        }}>
                          C
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                      {performance.player.army}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                      {performance.gamesPlayed}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                      <span style={{ 
                        color: performance.winRate >= 70 ? '#4caf50' : performance.winRate >= 50 ? '#ff9800' : '#f44336',
                        fontWeight: 'bold'
                      }}>
                        {performance.winRate.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                      {performance.averageObjectivePoints.toFixed(1)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                      {performance.killRatio.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#1a237e' }}>
                      {performance.totalTournamentPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            No player performance data available yet. Complete some matches to see statistics.
          </p>
        )}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div>
      {/* Special Achievements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {stats.mostKills && (
          <div style={cardStyle}>
            <h4 style={{ color: '#f44336', marginBottom: '1rem' }}>🏆 Highest Kill Ratio</h4>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                {stats.mostKills.player.nickname}
              </p>
              <p style={{ color: '#666', margin: '0.25rem 0' }}>{stats.mostKills.player.army}</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f44336', margin: '0.5rem 0' }}>
                {stats.mostKills.killRatio.toFixed(2)}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                {stats.mostKills.gamesPlayed} games played
              </p>
            </div>
          </div>
        )}

        {stats.highestObjectiveAverage && (
          <div style={cardStyle}>
            <h4 style={{ color: '#4caf50', marginBottom: '1rem' }}>🎯 Best Objective Player</h4>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                {stats.highestObjectiveAverage.player.nickname}
              </p>
              <p style={{ color: '#666', margin: '0.25rem 0' }}>{stats.highestObjectiveAverage.player.army}</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4caf50', margin: '0.5rem 0' }}>
                {stats.highestObjectiveAverage.averageObjectivePoints.toFixed(1)}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                average objective points
              </p>
            </div>
          </div>
        )}

        {stats.topPerformers.length > 0 && (
          <div style={cardStyle}>
            <h4 style={{ color: '#2196f3', marginBottom: '1rem' }}>👑 Tournament Leader</h4>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                {stats.topPerformers[0].player.nickname}
              </p>
              <p style={{ color: '#666', margin: '0.25rem 0' }}>{stats.topPerformers[0].player.army}</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196f3', margin: '0.5rem 0' }}>
                {stats.topPerformers[0].totalTournamentPoints}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                tournament points ({stats.topPerformers[0].winRate.toFixed(1)}% win rate)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div style={cardStyle}>
        <h4 style={{ marginBottom: '1rem' }}>Tournament Insights</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <h5 style={{ color: '#1a237e' }}>Most Popular Army</h5>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {stats.armyDistribution.length > 0 ? stats.armyDistribution[0].army : 'N/A'}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {stats.armyDistribution.length > 0 ? 
                `${stats.armyDistribution[0].count} players (${stats.armyDistribution[0].percentage.toFixed(1)}%)` : 
                'No data'
              }
            </p>
          </div>
          
          <div>
            <h5 style={{ color: '#1a237e' }}>Best Performing Army</h5>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {stats.armyPerformance.length > 0 ? stats.armyPerformance[0].army : 'N/A'}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {stats.armyPerformance.length > 0 ? 
                `${stats.armyPerformance[0].winRate.toFixed(1)}% win rate` : 
                'No data'
              }
            </p>
          </div>
          
          <div>
            <h5 style={{ color: '#1a237e' }}>Average Match Completion</h5>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {stats.totalMatches > 0 ? ((stats.completedMatches / stats.totalMatches) * 100).toFixed(1) : 0}%
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {stats.completedMatches} of {stats.totalMatches} matches
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem', color: '#1a237e' }}>Tournament Statistics</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          style={tabStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          style={tabStyle(activeTab === 'armies')}
          onClick={() => setActiveTab('armies')}
        >
          Army Analysis
        </button>
        <button 
          style={tabStyle(activeTab === 'players')}
          onClick={() => setActiveTab('players')}
        >
          Player Performance
        </button>
        <button 
          style={tabStyle(activeTab === 'achievements')}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'armies' && renderArmies()}
      {activeTab === 'players' && renderPlayers()}
      {activeTab === 'achievements' && renderAchievements()}
    </div>
  );
};

export default Statistics;