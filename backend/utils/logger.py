"""
Centralized Logging Configuration
"""

import logging
import os
import sys


def setup_logger(name: str = "kirana_uw") -> logging.Logger:
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        fmt = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(fmt)
        logger.addHandler(handler)

    logger.setLevel(getattr(logging, level, logging.INFO))
    logger.propagate = False
    return logger


# Root logger used across the project
root_logger = setup_logger()
