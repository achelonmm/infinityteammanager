import React, { useState, useEffect } from 'react';
import {
  ClipboardList, AlertCircle, FileText, Trophy, Zap, Target,
  Gamepad2, Palette, Clock, Flag, Swords, X, Save
} from 'lucide-react';
import { Player, IndividualMatch } from '../types';
import { calculateTeamTournamentPoints } from '../utils/rankingUtils';
import Modal from './Modal';
import clsx from 'clsx';
import styles from './IndividualMatchResultForm.module.css';

interface IndividualMatchResultFormProps {
  individualMatch: IndividualMatch;
  player1: Player;
  player2: Player;
  onSave: (matchId: string, results: Partial<IndividualMatch>) => void;
  onCancel: () => void;
}

const IndividualMatchResultForm: React.FC<IndividualMatchResultFormProps> = ({
  individualMatch,
  player1,
  player2,
  onSave,
  onCancel
}) => {
  const [results, setResults] = useState({
    objectivePoints1: individualMatch.objectivePoints1 || 0,
    objectivePoints2: individualMatch.objectivePoints2 || 0,
    victoryPointsFor1: individualMatch.victoryPointsFor1 || 0,
    victoryPointsFor2: individualMatch.victoryPointsFor2 || 0,
    paintedBonus1: individualMatch.paintedBonus1 || player1.isPainted,
    paintedBonus2: individualMatch.paintedBonus2 || player2.isPainted,
    lateListPenalty1: individualMatch.lateListPenalty1 || player1.armyListLate,
    lateListPenalty2: individualMatch.lateListPenalty2 || player2.armyListLate,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const calculatedPoints = {
    points1: calculateTeamTournamentPoints(
      results.objectivePoints1, results.objectivePoints2,
      results.paintedBonus1, results.paintedBonus2,
      results.lateListPenalty1, results.lateListPenalty2, true
    ),
    points2: calculateTeamTournamentPoints(
      results.objectivePoints1, results.objectivePoints2,
      results.paintedBonus1, results.paintedBonus2,
      results.lateListPenalty1, results.lateListPenalty2, false
    ),
  };

  useEffect(() => {
    setResults(prev => ({
      ...prev,
      paintedBonus1: individualMatch.paintedBonus1 || player1.isPainted,
      paintedBonus2: individualMatch.paintedBonus2 || player2.isPainted,
      lateListPenalty1: individualMatch.lateListPenalty1 || player1.armyListLate,
      lateListPenalty2: individualMatch.lateListPenalty2 || player2.armyListLate,
    }));
  }, [
    player1.isPainted, player2.isPainted,
    player1.armyListLate, player2.armyListLate,
    individualMatch.paintedBonus1, individualMatch.paintedBonus2,
    individualMatch.lateListPenalty1, individualMatch.lateListPenalty2,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (results.objectivePoints1 < 0 || results.objectivePoints1 > 10) {
      errors.push(`${player1.nickname}'s Objective Points must be between 0 and 10`);
    }
    if (results.objectivePoints2 < 0 || results.objectivePoints2 > 10) {
      errors.push(`${player2.nickname}'s Objective Points must be between 0 and 10`);
    }

    if (results.victoryPointsFor1 < 0 || results.victoryPointsFor1 > 300) {
      errors.push(`${player1.nickname}'s Victory Points must be between 0 and 300`);
    }
    if (results.victoryPointsFor2 < 0 || results.victoryPointsFor2 > 300) {
      errors.push(`${player2.nickname}'s Victory Points must be between 0 and 300`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalResults = {
        ...results,
        tournamentPoints1: calculatedPoints.points1,
        tournamentPoints2: calculatedPoints.points2,
        isCompleted: true
      };
      onSave(individualMatch.id, finalResults);
    } catch (error) {
      console.error('Error saving results:', error);
      setValidationErrors(['Error saving results. Please try again.']);
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: number | boolean) => {
    setResults(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationErrors([]);
  };

  const getMatchOutcome = () => {
    const obj1 = results.objectivePoints1;
    const obj2 = results.objectivePoints2;

    if (obj1 > obj2) return `${player1.nickname} Victory (${obj1} vs ${obj2})`;
    if (obj2 > obj1) return `${player2.nickname} Victory (${obj2} vs ${obj1})`;
    if (obj1 === obj2 && obj1 > 0) return `Tie (${obj1} vs ${obj2})`;
    return 'Enter objective points to see result';
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Match Results"
      titleIcon={<ClipboardList size={20} />}
      size="xl"
    >
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <div>
            <strong>Please fix the following errors:</strong>
            <ul className={styles.errorList}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Scoring Guide */}
      <div className={styles.scoringGuide}>
        <h4 className={styles.scoringGuideTitle}>
          <FileText size={18} className={styles.scoringGuideIcon} />
          Infinity Tournament Scoring
        </h4>
        <div className={styles.scoringGrid}>
          <div>
            <strong className={styles.scoringCategory}>
              <Trophy size={14} /> Base Tournament Points:
            </strong>
            <ul className={styles.scoringList}>
              <li><strong>Victory:</strong> 4 points (more Obj. Points)</li>
              <li><strong>Tie:</strong> 2 points (same Obj. Points)</li>
              <li><strong>Defeat:</strong> 0 points (less Obj. Points)</li>
            </ul>
          </div>
          <div>
            <strong className={styles.scoringCategory}>
              <Zap size={14} /> Bonus / Penalty Points:
            </strong>
            <ul className={styles.scoringList}>
              <li><strong>Offensive:</strong> +1 pt (5+ Obj. Points)</li>
              <li><strong>Defensive:</strong> +1 pt (lose by &le;2 Obj.)</li>
              <li><strong>Painted Army:</strong> +1 pt</li>
              <li><strong>Late Army List:</strong> -1 pt</li>
            </ul>
          </div>
          <div>
            <strong className={styles.scoringCategory}>
              <Target size={14} /> Tiebreakers:
            </strong>
            <ul className={styles.scoringList}>
              <li>1st: Objective Points</li>
              <li>2nd: Victory Points Difference</li>
              <li>3rd: Victory Points For</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Player Cards */}
      <div className={styles.playerCards}>
        <div className={clsx(styles.playerCard, styles.playerCard1)}>
          <h4 className={styles.playerName}>
            <Gamepad2 size={18} />
            {player1.nickname}
          </h4>
          <p className={styles.playerArmy}>
            {player1.army}
            {player1.isPainted && (
              <span className={styles.paintedTag}>
                <Palette size={12} /> Painted
              </span>
            )}
          </p>
          <div className={styles.pointsDisplay}>
            {calculatedPoints.points1} Tournament Points
          </div>
        </div>

        <div className={clsx(styles.playerCard, styles.playerCard2)}>
          <h4 className={styles.playerName}>
            <Gamepad2 size={18} />
            {player2.nickname}
          </h4>
          <p className={styles.playerArmy}>
            {player2.army}
            {player2.isPainted && (
              <span className={styles.paintedTag}>
                <Palette size={12} /> Painted
              </span>
            )}
          </p>
          <div className={styles.pointsDisplay}>
            {calculatedPoints.points2} Tournament Points
          </div>
        </div>
      </div>

      {/* Match Outcome */}
      <div className={styles.outcomeBar}>
        <Flag size={18} />
        {getMatchOutcome()}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Objective Points */}
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>
            <Target size={18} className={styles.sectionIcon} />
            Objective Points (determines winner) - Range: 0-10
          </h5>
          <div className={styles.inputRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                {player1.nickname}:
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={results.objectivePoints1 === 0 ? '' : results.objectivePoints1}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleChange('objectivePoints1', Math.min(10, Math.max(0, value)));
                }}
                className={styles.input}
                disabled={isSubmitting}
                placeholder="0"
                autoFocus
              />
              <small className={styles.inputHint}>Must be between 0 and 10</small>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                {player2.nickname}:
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={results.objectivePoints2 === 0 ? '' : results.objectivePoints2}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleChange('objectivePoints2', Math.min(10, Math.max(0, value)));
                }}
                className={styles.input}
                disabled={isSubmitting}
                placeholder="0"
              />
              <small className={styles.inputHint}>Must be between 0 and 10</small>
            </div>
          </div>
        </div>

        {/* Victory Points */}
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>
            <Swords size={18} className={styles.sectionIcon} />
            Victory Points For (tiebreaker) - Range: 0-300
          </h5>
          <div className={styles.inputRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                {player1.nickname}:
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={results.victoryPointsFor1 === 0 ? '' : results.victoryPointsFor1}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleChange('victoryPointsFor1', Math.min(300, Math.max(0, value)));
                }}
                className={styles.input}
                disabled={isSubmitting}
                placeholder="0"
              />
              <small className={styles.inputHint}>Must be between 0 and 300</small>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                {player2.nickname}:
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={results.victoryPointsFor2 === 0 ? '' : results.victoryPointsFor2}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleChange('victoryPointsFor2', Math.min(300, Math.max(0, value)));
                }}
                className={styles.input}
                disabled={isSubmitting}
                placeholder="0"
              />
              <small className={styles.inputHint}>Must be between 0 and 300</small>
            </div>
          </div>
        </div>

        {/* Painted Army Bonus */}
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>
            <Palette size={18} className={styles.sectionIcon} />
            Painted Army Bonus (+1 Tournament Point)
          </h5>
          <div className={styles.inputRow}>
            <label className={clsx(styles.paintedToggle, results.paintedBonus1 && styles.paintedToggleActive)}>
              <input
                type="checkbox"
                checked={results.paintedBonus1}
                onChange={(e) => handleChange('paintedBonus1', e.target.checked)}
                disabled={isSubmitting}
                className={styles.checkbox}
              />
              <Palette size={20} className={styles.paintedToggleIcon} />
              <div>
                <strong>{player1.nickname}</strong>
                {player1.isPainted && (
                  <div className={styles.paintedNote}>
                    Army marked as painted in profile
                  </div>
                )}
              </div>
            </label>

            <label className={clsx(styles.paintedToggle, results.paintedBonus2 && styles.paintedToggleActive)}>
              <input
                type="checkbox"
                checked={results.paintedBonus2}
                onChange={(e) => handleChange('paintedBonus2', e.target.checked)}
                disabled={isSubmitting}
                className={styles.checkbox}
              />
              <Palette size={20} className={styles.paintedToggleIcon} />
              <div>
                <strong>{player2.nickname}</strong>
                {player2.isPainted && (
                  <div className={styles.paintedNote}>
                    Army marked as painted in profile
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Late Army List Penalty */}
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>
            <Clock size={18} className={styles.sectionIcon} />
            Late Army List Penalty (-1 Tournament Point)
          </h5>
          <div className={styles.inputRow}>
            <label className={clsx(styles.lateToggle, results.lateListPenalty1 && styles.lateToggleActive)}>
              <input
                type="checkbox"
                checked={results.lateListPenalty1}
                onChange={(e) => handleChange('lateListPenalty1', e.target.checked)}
                disabled={isSubmitting}
                className={styles.checkbox}
              />
              <Clock size={20} className={styles.lateToggleIcon} />
              <div>
                <strong>{player1.nickname}</strong>
                {player1.armyListLate && (
                  <div className={styles.lateNote}>
                    Army list marked as late in profile
                  </div>
                )}
              </div>
            </label>

            <label className={clsx(styles.lateToggle, results.lateListPenalty2 && styles.lateToggleActive)}>
              <input
                type="checkbox"
                checked={results.lateListPenalty2}
                onChange={(e) => handleChange('lateListPenalty2', e.target.checked)}
                disabled={isSubmitting}
                className={styles.checkbox}
              />
              <Clock size={20} className={styles.lateToggleIcon} />
              <div>
                <strong>{player2.nickname}</strong>
                {player2.armyListLate && (
                  <div className={styles.lateNote}>
                    Army list marked as late in profile
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Results
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IndividualMatchResultForm;
