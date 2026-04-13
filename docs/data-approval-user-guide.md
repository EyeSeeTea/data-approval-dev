# Data Approval — User Guide

The **Data Approval** app (also known as *Data Approval Extended*) lets users review the status of dataset submissions across organisation units and periods, and take actions such as completing, submitting, approving or revoking data.

This guide explains the main list, the filters, the row actions and the configuration options that control what each user can see and do.

---

## 1. The Data Approval list

The main screen shows one row per **dataset / organisation unit / period** combination. Each row contains the following columns:

| Column | Description |
| --- | --- |
| **Data set** | The name of the dataset being tracked. |
| **Organisation unit** | The organisation unit that owns the data for that row. |
| **Period** | The reporting period (e.g. month, quarter or year, depending on the dataset's period type). |
| **Completion status** | Whether the dataset has been marked as *Completed* or is still *Not completed*. Marking a dataset as completed indicates that data entry for that period is finished. |
| **Submission status** | Indicates whether the data has been *Submitted* (validated and ready for approval), is *Ready for submission* (completed but not yet submitted), or *Not submitted*. |
| **Approval status** | Whether the data has been *Approved* by an authorised user or is still *Not approved*. |
| **Intermediate approval status** | *(Optional, hidden by default)* Whether an intermediate approval has been granted for the row. Possible values: *Approved*, *Not approved*, or *N/A* when the dataset does not require an intermediate approval. See [Section 7](#7-intermediate-approval) for details. |
| **Modification Count** | The number of data elements that have been modified since the last submission/approval. This is used to detect changes that may require a re-approval. See [Section 8](#8-data-element-groups-flag) for how this number is filtered when the *DataElementGroups* flag is enabled. |
| **Last modification date** | The date and time of the most recent change to a data value in the dataset. Shows *No data* if the dataset has never been edited. |
| **Last date of submission** | The date and time when the data was last submitted. Shows *Never submitted* when applicable. |
| **Last date of approval** | The date and time when the data was last approved. Shows *Never approved* when applicable. |

All dates are displayed in `yyyy-MM-dd HH:mm:ss` format.

The gear icon at the top right of the list lets you show or hide columns and reorder them. The **Intermediate approval status** column is **hidden by default** — tick it in the column selector to display it.

---

## 2. Filters and the *Apply Filters* button

A filter bar is displayed above the list. The available filters are:

- **Period Type** — only shown when the configured datasets use more than one period type. Lets you switch between e.g. monthly, quarterly or yearly views.
- **Data sets** — multi-select of the datasets configured for the app.
- **Org Units** — hierarchical selector for one or more organisation units.
- **Periods** — multi-select of the periods that are valid for the chosen period type.
- **Completion status** — *Completed* or *Not completed*.
- **Submission status** — *Submitted* or *Ready for submission*.
- **Approval status** — *Approved* or *Not Approved*.
- **Modification Count** — *0* (no changes) or *Greater than 0* (modified since last approval).

### Apply Filters button

Filter selections are **not** applied automatically. After changing any filter you must click **Apply Filters** for the list to be refreshed with the new criteria. This is intentional, because the underlying query can be expensive on large databases — clicking *Apply Filters* gives the user explicit control over when the request is sent.

A **Clear filters** button is also available; it resets all filters back to their default empty values. The list is then re-queried the next time *Apply Filters* is pressed.

---

## 3. Analytics-running notice

The Data Approval list relies on analytics tables to compute modification counts and other metrics. If the analytics process is currently running on the server, the list cannot be refreshed safely.

When this happens, the app shows the following message in a red alert box and the table is not displayed:

> **The list could not be loaded because analytics jobs are currently running. Please try again in a few seconds by clicking 'Apply Filters'.**

When you see this message, simply wait until the analytics job finishes and click **Apply Filters** again to retry.

---

## 4. Contextual row actions

When you select one or more rows in the list, a set of contextual actions becomes available. Each action is only enabled when it makes sense for the current state of the row(s) **and** when the current user has the corresponding permission (see [Section 6](#6-per-dataset-permission-groups)).

| Action | What it does | When it is available |
| --- | --- | --- |
| **Complete** | Marks the dataset as *Completed* for the selected period and organisation unit. This signals that data entry is finished. | When the row is *Not completed* and contains data. |
| **Incomplete** | Reverts a previously completed dataset back to *Not completed*. | When the row is *Completed* but has not yet been submitted. |
| **Submit** | Submits the data for approval. After submission the row appears as *Submitted* / *Ready for approval*. | When the row has not been approved and contains data. |
| **Intermediate Approve** | *(Optional — only on datasets with intermediate approval)* Grants an intermediate approval. See [Section 7](#7-intermediate-approval). | When the dataset requires intermediate approval, the user has permission, and the row is currently *Not approved* at the intermediate level. |
| **Intermediate Unapprove** | *(Optional — only on datasets with intermediate approval)* Removes a previously granted intermediate approval. | When the dataset requires intermediate approval, the user has permission, the row is currently *Approved* at the intermediate level, and the final approval has not yet been granted. |
| **Approve** | Approves the submitted data. After approval the row appears as *Approved* and the *Last date of approval* is set. | When the row has been modified and is *Not approved*. If the dataset requires an intermediate approval, this action is only available once the intermediate approval is in place (see [Section 7](#7-intermediate-approval)). |
| **Revoke** | Removes a previous approval, returning the row to *Not approved*. On datasets with intermediate approval, Revoke also resets the intermediate approval state back to *Not approved*. | When the row is currently *Approved*. |

In addition, a **Check Difference** action is available to see exactly which data elements have been modified since the last approval. This is useful before re-approving a dataset that has a *Modification Count* greater than zero.

---

## 5. Dataset configuration

Each dataset handled by the app has a configuration entry that tells the app:

- Which underlying dataset to read from (**Data set**) and which approval dataset to write approval metadata to (**Data set Approval**).
- Which data element to use to store the **Submit date** and which one for the **Approval date**, both inside the approval dataset.
- Which SQL views to use as data sources for the list (one for current periods, one for old periods).
- Whether **Submit also approves the dataSet** and whether **Revoke also marks the dataSet as incomplete**.
- *(Optional)* Whether **Intermediate approval required** is enabled and, if so, which data element stores the intermediate approval flag.
- Which user groups/users are allowed to perform each action.

The *Intermediate approve DataElement* field in the configuration form is disabled while *Intermediate approval required* is unchecked — ticking the flag enables the selector so you can pick the Yes/No data element used to track the intermediate state (see [Section 7](#7-intermediate-approval)).

---

## 6. Per-dataset permission groups

For each dataset configured in the app, an administrator can independently control **who** is allowed to perform each action. This is done from the dataset configuration screen, where the following permission categories are available:

- **Read** — who can see the dataset's rows in the Data Approval list.
- **Complete** — who can use the *Complete* action.
- **Incomplete** — who can use the *Incomplete* action.
- **Submit** — who can use the *Submit* action.
- **Revoke** — who can use the *Revoke* action.
- **Intermediate Approve** — who can use the *Intermediate Approve* / *Intermediate Unapprove* actions. *(Optional — only relevant when the dataset has Intermediate approval required.)*
- **Approve** — who can use the *Approve* action.

For each category, the administrator can grant access to:

- One or more **user groups**, and/or
- One or more **individual users**.

When a user opens the Data Approval list, the app checks their group membership and username against these permission lists. Any action the user does not have permission for will be hidden or disabled on the corresponding rows. Super-administrators bypass these checks and always see every action for every dataset.

This makes it possible, for example, to let a wide group of data clerks *Complete* and *Submit* data, a smaller group of reviewers perform *Intermediate Approve*, and an even smaller group of supervisors perform the final *Approve* and *Revoke*.

---

## 7. Intermediate approval

For datasets where a final approval should only be possible after a **first‑level review** has taken place, the app supports an optional intermediate approval step. It is configured per dataset and disabled by default.

### 7.1 Configuration

On the dataset configuration form, an administrator can turn on **Intermediate approval required** and pick an *Intermediate Approve DataElement*. This must be a Yes/No (boolean) data element that lives in the **approval dataset** (APVD) of that configuration. The app stores the intermediate state on that data element per organisation unit and period.

A separate **Intermediate Approve** permission group is also available on the configuration form, so administrators can list which user groups/users are allowed to use the *Intermediate Approve* and *Intermediate Unapprove* actions.

When the flag is **off** for a dataset, nothing changes: the *Intermediate approval status* column shows *N/A*, the intermediate actions are hidden, and the existing *Approve* action works exactly as described in earlier sections.

### 7.2 The Intermediate approval status column

When the flag is **on**, the *Intermediate approval status* column (hidden by default — enable it from the column selector) reflects the **effective** intermediate state:

- **Approved** — the intermediate data element is set to *Yes* **and** there are no pending modifications (*Modification Count = 0*).
- **Not approved** — the intermediate data element is *No*, empty, **or** there are pending modifications that invalidate a previously granted intermediate approval.
- **N/A** — this dataset does not require an intermediate approval.

The modification‑count check is purely derivational: if somebody edits a data value after an intermediate approval has been granted, the list automatically shows *Not approved* in this column and gates the *Approve* action accordingly. The stored data element value is not touched — to re‑affirm the approval after a modification, the user simply runs *Intermediate Approve* again.

### 7.3 The intermediate actions

Two new actions appear in the contextual menu when the dataset requires intermediate approval and the user has the *Intermediate Approve* permission:

- **Intermediate Approve** — writes *true* to the configured intermediate data element for every selected row (default category option combo). It is only offered when the row has data, is currently *Not approved* at the intermediate level, and has a non‑zero modification count. Multiple rows can be selected.
- **Intermediate Unapprove** — writes *false* to the same data element. Offered when the stored intermediate value is currently *Yes* and the final approval has **not** been granted yet (to undo a final approval first, use *Revoke*). Multiple rows can be selected.

### 7.4 How Intermediate approval gates the final *Approve*

When a dataset requires intermediate approval, the *Approve* action in the contextual menu is only available when **every** selected row has *effective intermediate status = Approved*:

- On a single row where the intermediate step has not been done, *Approve* is hidden.
- On a multi‑select where at least one of the selected rows has not been intermediate‑approved, *Approve* is hidden entirely (even if some of the other selected rows are eligible).
- When the flag is off for that dataset, *Approve* works as before.

### 7.5 Interaction with Revoke

Running **Revoke** on a row with intermediate approval has a cascading effect: the app revokes the final approval **and** resets the intermediate approval back to *No*. The reviewer therefore has to re‑grant the intermediate approval before *Approve* can be run again. This ensures the approval chain is always fully re‑played whenever a row goes back to an editable state.

---

## 8. Data Element Groups flag

Each dataset configuration has an optional flag — **Restrict modification display by Data Element Group sharing** — that changes how the *Modification Count* and *Check Difference* features behave.

- **When the flag is OFF (default):** all data elements in the dataset are considered when calculating the modification count. Every change to any data element since the last approval increases the count.

- **When the flag is ON:** the app only considers data elements that belong to a **Data Element Group** to which the current user has *read* access (either directly or through one of their user groups). Changes to data elements outside those groups are ignored both in the modification count and in the *Check Difference* dialog.

This is useful in deployments where different teams are responsible for different subsets of the data elements within a single dataset: each team only sees changes that are relevant to them, and is not alerted to modifications they have no business reviewing.

Super-administrators bypass this restriction and always see the unfiltered modification count.

---

## Quick reference: typical workflow

1. **Filter** the list down to the datasets, organisation units and periods you are interested in, then click **Apply Filters**.
2. Look at the **Completion**, **Submission** and **Approval** status columns to find the rows that need attention. If the dataset uses intermediate approval, show the **Intermediate approval status** column from the gear menu to see where each row stands.
3. If a row has a non-zero **Modification Count**, use **Check Difference** to inspect what changed.
4. Select the rows and run the appropriate contextual action: **Complete**, **Submit**, **Intermediate Approve** (if configured), **Approve**, or — when needed — **Incomplete** / **Intermediate Unapprove** / **Revoke**.
5. If the list refuses to refresh because analytics are running, wait a few seconds and click **Apply Filters** again.
