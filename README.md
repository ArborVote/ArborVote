# 🌳 ArborVote 🗳
**Rational decision-making by quadratic voting on argument trees.**

[![Build Status](https://travis-ci.org/Michael-A-Heuer/ArborVote.svg?branch=master)](https://travis-ci.org/Michael-A-Heuer/ArborVote)
[![Coverage Status](https://coveralls.io/repos/github/Michael-A-Heuer/ArborVote/badge.svg?branch=master)](https://coveralls.io/github/Michael-A-Heuer/ArborVote?branch=master)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/Michael-A-Heuer/ArborVote/pulls)


**ArborVote** is a tool for rational decision-making based on arguments.
The key idea of this project is to stake/quadratic vote 🗳 on a binary tree 🌳 of pro and con arguments instead of directly voting for or against a decision.
In the end, the cumulative weight of the arguments summed from the branches to the root of the tree determines the decision.
Governance forms  based on arguments are not new and known under the term [deliberative democracy](https://en.wikipedia.org/wiki/Deliberative_democracy).

Decision-making based on arguments is unpopular because of the bureaucratic overhead connected to it. 
A centralized platform ([kialo.com](https://www.kialo.com)) overcame this issue and does a great job by
* keeping debates **rational**
* presenting debates in a **structured and transparent** way and thus 
* allowing for **fast onboarding of participants** 

([see an exemplary debate](https://www.kialo.com/humans-should-act-to-fight-climate-change-4540)). 
Participants create a binary tree of pro and con arguments and can express preference by voting on them.
Still, the platform is not designed for actual voting because it lacks resilience against manipulation and sybil attacks.

This gap can be filled with blockchain technology by
* adding a **decentralized and quadratic voting system** and 
* providing **economic incentives** for participation.

Argument-based decision-making could be a useful building block in future DAOs.

### npm Scripts
- **postinstall**: Runs after installing dependencies.
- **build-app**: Installs front end project (app/) dependencies.
- **start** Runs your app inside a DAO.
- **compile**: Compiles the smart contracts.
- **test**: Runs tests for the contracts.
