#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> lastIndex(256, -1); // store last seen index of characters
        int maxLen = 0;
        int start = 0;

        for (int i = 0; i < (int)s.size(); i++) {
            if (lastIndex[s[i]] >= start) {
                start = lastIndex[s[i]] + 1; // move start if char repeated
            }
            lastIndex[s[i]] = i; // update last index
            maxLen = max(maxLen, i - start + 1);
        }
        return maxLen;
    }
};

// Runner
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string s;
    getline(cin, s);
    
    Solution sol;
    int result = sol.lengthOfLongestSubstring(s);
    cout << result << "\n";
    
    return 0;
}
