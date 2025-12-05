## Generic Data Quality 76 hours.

-   Update metadata: remove unnecessary program stages, dataElements, attributes, optionSets, etc. Check MetadataD2Repository.ts for more details. Consider to remove NHWA prefixes for all metadata (optional, but makes sense if this is going to be a generic app) [4h]

-   Remove steps "Disaggregates" (step 2), "General Practitioners" (step 3) and "Nursing/Midwifery" (step 4) in code (entities, usecases). [4h]

-   Update default settings related to NHWA. Remove sections configuration for steps 2, 3 and 4. [2h]

-   Remove "contact emails" from issues (Include specific NHWA logic on how to update this field) [2h]

-   Create data quality in an specific org. unit [4-8h] TBD logic on what happen if user is assigned to multiple org. units.

-   Load all dataSets instead hardcodes: NHWA module 1 and 2. [4h]

-   Load periods according dataSet periodType [6h]

-   Add messages for each issue. [60h] (this could be less hours, but I'm being conservative here because we don't have UI yet)
    -   A message can have: title, message, from_user_id, to_user_id, org_unit_id, issue_id, section_id, date_sent
    -   Messages will be saved in another program "Issue Messages"
    -   Post messages to DHIS2 using the messaging api `/api/messageConversations`
    -   "to_users" only should read their own messages

## Mal Approval Report: 91 hours (+80 hours if we decide to migrate existing code from promises to futures)

-   Move code to new repo (based on skeleton app) [24h]
-   Update namespace (right now everything is under "d2-reports") [1h]
-   New page for configure dataSets relationships (original dataSet -> approval dataSet) [30h]
-   Settings page
    -   Configure sharing settings for dataSets actions: You select a dataSet and assign userGroups with write/read access. Users with read access can list the dataSets but not execute any action. [16h]
    -   Update logic to apply current sharing settings. Admin users always have access to everything (authority "ALL") [16h]
    -   Configure sqlview (save preference in userDataStore) [4h]
-   Migrate existing code from promises to futures. [80h] (not required for functionality just to keep best practices)

## Autogenforms:
