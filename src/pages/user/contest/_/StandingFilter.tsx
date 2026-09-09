import React, { ChangeEvent } from "react";
import {Button, Dropdown} from "react-bootstrap";

import "./ContestStanding.css";
import "styles/Ratings.css";
import "./StandingFilter.css";
import { BiTrash, FaFilter } from "components/icons";


import {useDispatch, useSelector} from "react-redux";
import {
  addOrgToFilter,
  toggleFavoriteOnly,
  toggleOrgFilter,
} from "redux/StandingFilter/action";

interface ClearIconProps {
  onClick?: () => void;
  [key: string]: unknown;
}

const ClearIcon = (props: ClearIconProps) => {
  return <BiTrash className="clear-icon" size={18} {...props} />;
};

interface OrgShape {
  slug: string;
  name: string;
  [key: string]: unknown;
}

interface StandingFilterProps {
  contestId: string;
  orgList?: OrgShape[];
  [key: string]: unknown;
}

interface StandingFilterEntry {
  filteredOrg: string[];
  isOrgFilterEnable: boolean;
  favoriteTeams: string[];
  isFavoriteOnly: boolean;
}

const StandingFilter = ({contestId, orgList}: StandingFilterProps) => {
  const filter = useSelector(
    (state: { standingFilter: { standingFilter: Record<string, StandingFilterEntry | undefined> } }) =>
      state.standingFilter.standingFilter[contestId]
  );
  const dispatch = useDispatch();
  const [selectedOrg, setSelectedOrg] = React.useState<string[]>([]);

  const isOrgFilterEnable = filter?.isOrgFilterEnable;
  const isFavoriteEnable = filter?.isFavoriteOnly;

  const onOrgFilterSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    let selectedIds: string[] = [];
    const options = e.target.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selectedIds.push(options[i].value);
    }
    setSelectedOrg(selectedIds);
  };

  const onToggleOrgFilter = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(toggleOrgFilter({contestId, isEnable: e.target.checked}));
  };
  const onToggleFavoriteFilter = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(toggleFavoriteOnly({contestId, isEnable: e.target.checked, isClearAll: false}));
  };

  const onSaveClick = () => {
    dispatch(addOrgToFilter({contestId, orgList: selectedOrg}));
  };

  const onClearOrgFilter = () => {
    dispatch(toggleOrgFilter({contestId, isEnable: false}));
    dispatch(addOrgToFilter({contestId, orgList: []}));
    setSelectedOrg([]);
  };

  const onClearFavoriteFilter = () => {
    dispatch(
      toggleFavoriteOnly({contestId, isEnable: false, isClearAll: true})
    );
  };

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant={
          isOrgFilterEnable || isFavoriteEnable ? "primary" : "secondary"
        }
        className="btn-svg"
      >
        <FaFilter size={18} /> Filter
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <div id="standing-filter">
          <div className="filter-col org-filter">
            <div className="filter-label">
              <label>
                <input
                  type="checkbox"
                  onChange={onToggleOrgFilter}
                  checked={!!isOrgFilterEnable}
                />
                <span>Filter by Orgs</span>
              </label>
              <ClearIcon onClick={onClearOrgFilter} />
            </div>
            <select
              multiple
              name="org-filter"
              className="filter-container border rounded"
              onChange={onOrgFilterSelectChange}
            >
              {orgList?.map(org => {
                return (
                  <option
                    key={`opt-org-${org.slug}`}
                    value={org.slug}
                    selected={selectedOrg.includes(org.slug)}
                    className="filter-option"
                  >
                    {`(${org.slug}) ${org.name}`}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="filter-label">
            <label>
              <input
                type="checkbox"
                checked={!!isFavoriteEnable}
                onChange={onToggleFavoriteFilter}
              />
              <span>With Favorites</span>
            </label>
            <ClearIcon onClick={onClearFavoriteFilter} />
          </div>
          <div className="filter-control-btn">
            <Button size="sm" onClick={onSaveClick}>
              Save
            </Button>
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default StandingFilter;
