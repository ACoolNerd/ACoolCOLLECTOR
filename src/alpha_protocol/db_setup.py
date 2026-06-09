import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../../data/db/omnianalysis.db')

def setup_database():
    """Initializes the SQLite database for the Omnianalysis Framework."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Cards Master Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        set_name TEXT NOT NULL,
        year INTEGER,
        sport TEXT,
        player TEXT,
        tcg_id TEXT,
        sportscardspro_id TEXT
    )
    ''')

    # Pricing & Grading Matrix Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS market_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER,
        source TEXT NOT NULL, -- e.g., 'SportsCardsPro', '130point', 'TCGPlayer'
        grade_company TEXT, -- e.g., 'PSA', 'BGS', 'SGC', 'CGC', 'TAG', 'Raw'
        grade_value TEXT, -- e.g., '10', '9.5', 'Pristine 10', 'Black Label'
        price REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards (id)
    )
    ''')

    # Specific Grading Subgrades (Crucial for Omnianalysis)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS subgrades (
        market_data_id INTEGER,
        centering REAL,
        corners REAL,
        edges REAL,
        surface REAL,
        FOREIGN KEY (market_data_id) REFERENCES market_data (id)
    )
    ''')

    conn.commit()
    conn.close()
    print("Ruth Review Standard Met: Omnianalysis Database Initialized Successfully.")

if __name__ == "__main__":
    setup_database()
