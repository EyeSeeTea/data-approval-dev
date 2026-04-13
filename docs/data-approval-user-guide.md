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
| **Modification Count** | The number of data elements that have been modified since the last submission/approval. This is used to detect changes that may require a re-approval. See [Section 6](#6-data-element-groups-flag) for how this number is filtered when the *DataElementGroups* flag is enabled. |
| **Last modification date** | The date and time of the most recent change to a data value in the dataset. Shows *No data* if the dataset has never been edited. |
| **Last date of submission** | The date and time when the data was last submitted. Shows *Never submitted* when applicable. |
| **Last date of approval** | The date and time when the data was last approved. Shows *Never approved* when applicable. |

All dates are displayed in `yyyy-MM-dd HH:mm:ss` format.

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

> **The list could not be loaded because analytics jobs are currently running. Please try again in a few minutes by clicking 'Apply Filters'.**

When you see this message, simply wait until the analytics job finishes and click **Apply Filters** again to retry.

---

## 4. Contextual row actions

When you select one or more rows in the list, a set of contextual actions becomes available. Each action is only enabled when it makes sense for the current state of the row(s) **and** when the current user has the corresponding permission (see [Section 5](#5-per-dataset-permission-groups)).

| Action | What it does | When it is available |
| --- | --- | --- |
| **Complete** | Marks the dataset as *Completed* for the selected period and organisation unit. This signals that data entry is finished. | When the row is *Not completed* and contains data. |
| **Incomplete** | Reverts a previously completed dataset back to *Not completed*. | When the row is *Completed* but has not yet been submitted. |
| **Submit** | Submits the data for approval. After submission the row appears as *Submitted* / *Ready for approval*. | When the row has not been approved and contains data. |
| **Revoke** | Removes a previous approval, returning the row to *Not approved*. | When the row is currently *Approved*. |
| **Approve** | Approves the submitted data. After approval the row appears as *Approved* and the *Last date of approval* is set. | When the row is *Not approved* and the data has been submitted/modified. |

In addition, a **Check Difference** action is available to see exactly which data elements have been modified since the last approval. This is useful before re-approving a dataset that has a *Modification Count* greater than zero.

---

## 5. Per-dataset permission groups

For each dataset configured in the app, an administrator can independently control **who** is allowed to perform each action. This is done from the dataset configuration screen, where the following permission categories are available:

- **Read** — who can see the dataset's rows in the Data Approval list.
- **Complete** — who can use the *Complete* action.
- **Incomplete** — who can use the *Incomplete* action.
- **Submit** — who can use the *Submit* action.
- **Revoke** — who can use the *Revoke* action.
- **Approve** — who can use the *Approve* action.

For each category, the administrator can grant access to:

- One or more **user groups**, and/or
- One or more **individual users**.

When a user opens the Data Approval list, the app checks their group membership and username against these permission lists. Any action the user does not have permission for will be hidden or disabled on the corresponding rows. Super-administrators bypass these checks and always see every action for every dataset.

This makes it possible, for example, to let a wide group of data clerks *Complete* and *Submit* data, while restricting *Approve* and *Revoke* to a small group of supervisors.

---

## 6. Data Element Groups flag

Each dataset configuration has an optional flag — **Restrict modification display by Data Element Group sharing** — that changes how the *Modification Count* and *Check Difference* features behave.

- **When the flag is OFF (default):** all data elements in the dataset are considered when calculating the modification count. Every change to any data element since the last approval increases the count.

- **When the flag is ON:** the app only considers data elements that belong to a **Data Element Group** to which the current user has *read* access (either directly or through one of their user groups). Changes to data elements outside those groups are ignored both in the modification count and in the *Check Difference* dialog.

This is useful in deployments where different teams are responsible for different subsets of the data elements within a single dataset: each team only sees changes that are relevant to them, and is not alerted to modifications they have no business reviewing.

Super-administrators bypass this restriction and always see the unfiltered modification count.

---

## Quick reference: typical workflow

1. **Filter** the list down to the datasets, organisation units and periods you are interested in, then click **Apply Filters**.
2. Look at the **Completion**, **Submission** and **Approval** status columns to find the rows that need attention.
3. If a row has a non-zero **Modification Count**, use **Check Difference** to inspect what changed.
4. Select the rows and run the appropriate contextual action: **Complete**, **Submit**, **Approve**, or — when needed — **Incomplete** / **Revoke**.
5. If the list refuses to refresh because analytics are running, wait a few seconds and click **Apply Filters** again.
