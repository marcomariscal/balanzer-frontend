import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getRebalancePeriodFromAPI,
  getRebalanceStrategyFromAPI,
  setRebalancePeriodInAPI,
  setRebalanceStrategyInAPI,
  syncUserData,
} from "../actions/currentUser";
import { rebalancePeriodTimeframes } from "../helpers/timeframes";
import {
  showRebalancePeriodModalInState,
  closeRebalancePeriodModal,
  closeRebalanceAssetSelectModal,
} from "../actions/rebalance";
import RebalancePeriodSelectModal from "./RebalancePeriodSelectModal";
import EditRebalanceStrategyForm from "./EditRebalanceStrategyForm";
import Summary from "./Summary";
import BarTable from "./BarTable";
import "./Automate.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const Automate = () => {
  const dispatch = useDispatch();
  const {
    user,
    currentAccount,
    rebalanceStrategy,
    rebalancePeriod,
    totalBalanceUSD,
    balances,
  } = useSelector((st) => st.currentUser);
  const { loading } = useSelector((st) => st.general);
  const { showRebalancePeriodModal } = useSelector((st) => st.rebalance);

  const [isEditingStrategy, setIsEditingStrategy] = useState(false);

  // form details to be able to update the rebalance strategy
  const [rebalanceStrategyForm, setRebalanceStrategyForm] = useState(balances);

  const handleAddAssetToStrategy = (symbol) => {
    setRebalanceStrategyForm((strat) => [
      ...strat,
      { symbol, allocationPct: 0, actualPctOfTotal: 0 },
    ]);
    dispatch(closeRebalanceAssetSelectModal());
  };

  useEffect(() => {
    async function getRebalanceInfo() {
      dispatch(getRebalancePeriodFromAPI(user.username, currentAccount.id));
      dispatch(getRebalanceStrategyFromAPI(user.username, currentAccount.id));
    }

    getRebalanceInfo();
  }, [rebalancePeriod, currentAccount.id, dispatch, user.username]);

  const handleRebalancePeriodChange = (e) => {
    dispatch(
      setRebalancePeriodInAPI(user.username, currentAccount.id, {
        rebalancePeriod: e.target.value,
      })
    );

    dispatch(closeRebalancePeriodModal());
  };

  const handleShowPeriodSelectModal = () => {
    dispatch(showRebalancePeriodModalInState());
  };

  const handleClosePeriodSelectModal = () =>
    dispatch(closeRebalancePeriodModal());

  const handleEditRebalanceStrategy = (e) => {
    setIsEditingStrategy((edit) => !edit);
  };

  const handleSubmitStrategy = (e) => {
    e.preventDefault();

    // we only need the symbol and allocation target percentage to update the rebalance strategy
    let allocations = rebalanceStrategyForm.map(
      ({ symbol, allocationPct }) => ({
        symbol,
        percent: allocationPct.toString(),
      })
    );

    allocations = allocations.filter((bal) => bal.percent !== "0");

    dispatch(
      setRebalanceStrategyInAPI(user.username, currentAccount.id, allocations)
    );
    dispatch(syncUserData(user.username, currentAccount.id));
  };

  const rebalancePeriodText =
    rebalancePeriod === 0
      ? "None"
      : rebalancePeriodTimeframes.has(rebalancePeriod)
      ? rebalancePeriodTimeframes.get(rebalancePeriod)
      : `${rebalancePeriod} hours`;

  if (!currentAccount) {
    return (
      <div className="Dashboard container text-center">
        <h2>Please connect to an account</h2>
      </div>
    );
  }

  return (
    <div className="Automate container text-center">
      <div className="summary">
        <button
          className="summary-rebalance-period"
          onClick={handleShowPeriodSelectModal}
        >
          <div className="edit-icon-wrapper">
            <FontAwesomeIcon icon={faEdit} className="edit-icon" />
          </div>
          <Summary
            title={rebalancePeriodText}
            subTitle={"Current Rebalance Period"}
            loading={loading}
          />
        </button>
        <Summary title={totalBalanceUSD} subTitle={"Portfolio Balance"} />
      </div>

      <RebalancePeriodSelectModal
        showModal={showRebalancePeriodModal}
        closeModal={handleClosePeriodSelectModal}
        handleSubmit={handleRebalancePeriodChange}
      />
      <div className="bartable-wrapper">
        {isEditingStrategy ? (
          <EditRebalanceStrategyForm
            rebalanceStrategyForm={rebalanceStrategyForm}
            cancelEdit={handleEditRebalanceStrategy}
            handleAddAsset={handleAddAssetToStrategy}
            rebalanceStrategy={rebalanceStrategy}
            setRebalanceStrategy={setRebalanceStrategyForm}
            submitStrategy={handleSubmitStrategy}
          />
        ) : (
          <BarTable
            handleEdit={handleEditRebalanceStrategy}
            rebalanceStrategyForm={rebalanceStrategyForm}
            handleAddAsset={handleAddAssetToStrategy}
          />
        )}
      </div>
    </div>
  );
};

export default Automate;