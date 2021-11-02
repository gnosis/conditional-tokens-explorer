Version 0.3.2 (2021-11-02)
==========================

- Bump url-parse from 1.5.1 to 1.5.3 #861
- Enable Wrap button for Position Details #1914d5a
- Disable Wrap and Unwrapp features from Position list #e7cde29
- Fix React Hook useCallback has missing dependencies from Unwrap modal #b2db9fc
- Fix formatBigNumber format check #e364b6d

Version 0.3.1 (2021-09-08)
==========================

- Hotfix Position List skip limit GQL #855 
-  xDai support #793 
- Add Wrapper 1155-to-20 #847
- Fix moment/UTC use #843
- Add other PR fixed issues #801 #797 #805 #807 #811

Version 0.3.0 (2020-12-03)
==========================

- Fix regression in redeem #734
- Question/Outcomes/Category is not displayed in an Omen condition details when create in it the CTE #718
- Do not apply 3 sec of a delay when a date field is filled in with a correct value #711
- Enable 'Clear' button as soon as a value appears in the Date filter #706
- Split position: The app is crashed when switch to the Position option #705
- T[here is no link to Omen markets when create an Omen condition #703
- Lists filter results are not reset after connecting to a wallet  #702
- [UX / UI] Remove unnecessary "Close button" #696
- Redeem is not working (positions are not zero out and no tokens are returned to a wallet) #693
- Cannot resolve an Omen condition which was created by a currently connected wallet #692
- Full fetch thegraph for conditions #690
- Typos in the Terms/Cookie policy pages  #687
- Container is too big when there is no positions for a condition on a condition details page #674
- Condition Id field is cleared out when select a position to merge with for a position with 2 conditions #673
- UI issues with Cookie/Privacy Policy pages #672
- UI issues with Terms and Conditions page #671
- Positions list: 2nd search query does not appear when filter/search for a position  #662
- UI - '...date is invalid' appears as soon as start typing into a date filter #661
- It may take up to 10 sec until filter results are loaded in the select position section#660
- [Staging+Prod] cDAI icon is blinking when open Collateral filter in the Postitions list #577
- [FE] Add spinner to Outcomes table in "Report Payouts" #596
- Filter by collateral: loader is not always displayed when switch between collaterals in the filter #604
- Rounding issue in the merge positions preview #613
- Report payouts: not to show 'At least one payout must be positive' warning until clear out all the payouts fields #615
- No question text for an Omen condition when there is no relevant Omen markets #622
- UI - wrap text by words in the outcomes section on a position details page #626
- Conditions filters: 'Go' arrow is enabled when empty value is displayed in the 'Number of Outcomes' fields #630
- Reality.eth is not displayed in the Oracles pop-up when there are 2 oracles for a position #633
- Empty The reported array is displayed after successful report payouts #642
- UI: selected position/condition is not highlighted in the select position/condition sections  #649
- Report button should be enabled and call connection pop-up on the Report payouts page #652
- 'Use Position Balance ($0.00)' should be disabled when no positions to merge are selected #653
- 'Use Wallet Balance' remains to display wallet amount of DAI when switch to 'Position' option #654
- 'Merge with' section shows positions with 0 balance to merge  #657
- Previously selected option in filter dropdowns remain to be highlighted after Clear Filters #659

Version 0.2.0 (2020-11-10)
==========================

- Confirmation message to delete outcomes is not visible when there too many outcomes in the partition section #575
- UI - CONDITION\'S SPLIT POSITIONS section has a double bottom border when it is empty #576
- Cannot merge 3 or more positions of a deeper level #484
- [Prod/Dev] 404 error appears when open condition details from a position detail (when there are \>1 conditions) #580
- [FE] Impossible to merge positions of a \'deeper\' level (collateral USDC) #362
- [FE] Balance of a position is not cleared out after a merge #365
- [FE] Redeem positions: Incorrect field\'s values for the RESOLVED CONDITION ID/ REDEEMED POSITION PREVIEW #313
- [UI/UX] Mobile version: UI issues to fix and discuss #330
- Select positions list is blinking when search for a position #396
- [FE] Select position list blinking / flashing #391
- UI: Warning pop-up with an error \"expands\" Select position pop-up #388
- [FE] Crash when splitting from a condition with many outcomes #490
- Given 2 positions A and B\|C their merge preview is wrong #487
- [FE] Crash when splitting from a condition with more than 31 outcomes #261
- When disconnected, the app use default Rinkeby for the Network: it causes errors with filtering #555
- Nothing happens when click on the Ok button on the \'Are you sure you want to leave this page?\' pop-up when navigate to the same page #552
- Empty Condition Id Preview section appears when prepare an omen condition as a not logged in user #559
- Impossible to open a duplicated conditions by the left click on the Duplicated Condition warning #522
- Prepare condition: \'working..\' pop-up hangs when connect a wallet after pressing on the \'Prepare\' button #561
- Redeem Positions heading is missing #545
- Disable sorting by Reporter/Oracle in the Conditions list #562
- [FE] Improve pagination in the condition list section #123
- Display oracle = realit.io for a position when it belongs to an omen condition #538
- Link to oracle if it is known #540
- Omen Condition: Prepare button remains disabled until open and reselect a category #486
- Collateral symbol search: Add a possibility to search by all the words that start with a symbol #524
- Positions list: cDAI icon is blinking when open Collateral filter in mainnet #525
- Add a link to the docs #548
- Render question text, rather than ID, for Omen/Reality.eth conditions and positions #541
- [FE] Implement a warning pop-up to prevent data loss when leaving a page #211
- UI/UX: issues with search/filters on the Positions and Conditions pages #440
- UI issues with Positions/Conditions grids #499
- [FE] Split Position Result Modal window appears when transaction is failed #276
- Add a possibility to search by a custom collateral symbol #504

Version 0.1.0 (2020-10-28)
==========================

Position list, search, and filter features
------------------------------------------
- [FE] Position List Search Items, improvements for searching in the subgraph #507
- Positions list: Search query hags eternally when switch search options #506
- Positions/Conditions list: Pagination is not reset to the 1st page after filters applying #505
- Add a possibility to search by a custom collateral symbol #504
- Creation date: validation message is displayed when clear out any filter field #503
- [FE] Move \'Custom Token\' option to the bottom in the Collateral filter #501
- UI issues with Positions/Conditions grids #499
- UI: Custom collateral icons are loaded with a delay on Positions list #496
- Creation date filter: No validation message when From date to date (1 day difference) #481
- [FE] Positions List Filters #411
- [FE] Positions List Search Items #413

Condition list, search, and filter features
-------------------------------------------
- [FE] Remove Kleros from the filters][475]
- [FE] Conditions list: Search returns no results when a creation date filter is filled with To=From date #469
- [FE] Search results are not refreshed when clear out values in the > \'Number of outcomes\' and \'Created date\' filters #468
- [FE] Search returns an odd GraphQL error when search by numbers #467
- [FE] Filters are not applied when the user connects #460
- [UI / UX] Column names overlap each other when filter is opened #459
- [FE] Disable report payout option when a condition is resolved #458
- [FE] Condition List Search Items, improvements for searching in the subgraph #447
- UI/UX: issues with search/filters on the Positions and Conditions pages #440
- [FE - UI/UX] New Search Feature #403
- [FE - UI/UX] New Filters Feature #404

Split positions
---------------
- Increase a click area in the Split positions pop-up for navigation icon #482
- Change column title from in the Select Condition pop-up #480

Prepare Condition
-----------------
- [FE] Make Kleros the default arbitrator for Omen Conditions #474
- Resolved in Realit.io condition is displayed like an Open one in CTEAF app #466
- [FE] Edit / Remove outcomes is not working #451
- Prepare Omen condition: issues with the Resolution date field #434

Redeem Positions
----------------

- Redeem positions: select position pop-up hangs (eternally) when click on the Position field \>3 times #398

